import os
import requests as http_requests

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .models import *
from .serializers import *


# ───── РЕГИСТРАЦИЯ ─────

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get('username')
    email = request.data.get('email', '')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'username and password required'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already taken'}, status=status.HTTP_400_BAD_REQUEST)
    if email and User.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, email=email, password=password)
    return Response({'id': user.id, 'username': user.username}, status=status.HTTP_201_CREATED)


# ───── GOOGLE АВТОРИЗАЦИЯ ─────

GOOGLE_CLIENT_ID = '818339186100-48c4r7ivmnv71bv5trg2go6p2630qipu.apps.googleusercontent.com'

@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    credential = request.data.get('credential')
    if not credential:
        return Response({'error': 'credential required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        google_response = http_requests.get(
            f'https://oauth2.googleapis.com/tokeninfo?id_token={credential}',
            timeout=10
        )
        if google_response.status_code != 200:
            return Response({'error': 'Google token verification failed'}, status=status.HTTP_400_BAD_REQUEST)

        id_info = google_response.json()

        if id_info.get('aud') != GOOGLE_CLIENT_ID:
            return Response({'error': 'Token audience mismatch'}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({'error': f'Google verification error: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    email = id_info.get('email', '')
    name = id_info.get('name', email.split('@')[0])
    username = email.split('@')[0]

    if not email:
        return Response({'error': 'Email not provided by Google'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.filter(email=email).first()
    if not user:
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f'{base_username}{counter}'
            counter += 1
        user = User.objects.create_user(username=username, email=email, first_name=name)

    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'username': user.username,
    })


# ───── ЖАНРЫ ─────

@api_view(['GET'])
@permission_classes([AllowAny])
def genre_list(request):
    genres = Genre.objects.all()
    serializer = GenreSerializer(genres, many=True)
    return Response(serializer.data)


# ───── ОТЗЫВЫ ─────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def review_list_create(request):
    if request.method == 'GET':
        reviews = Review.objects.all()
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ───── МОЙ СПИСОК ─────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def user_anime_list(request):
    if request.method == 'GET':
        items = UserAnimeList.objects.filter(user=request.user)
        serializer = UserAnimeListSerializer(items, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = UserAnimeListSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def user_anime_list_detail(request, pk):
    try:
        item = UserAnimeList.objects.get(pk=pk, user=request.user)
    except UserAnimeList.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PATCH':
        serializer = UserAnimeListSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ───── ЧАТБОТ ─────

@api_view(['POST'])
@permission_classes([AllowAny])
def chat_bot(request):
    history = request.data.get('history', [])
    if not history:
        return Response({'error': 'Empty history'}, status=status.HTTP_400_BAD_REQUEST)

    api_key = os.environ.get('GROQ_API_KEY', '')
    if not api_key:
        return Response({'reply': 'GROQ_API_KEY не настроен на сервере.'})

    anime_list = Anime.objects.prefetch_related('genres').all()
    anime_catalog = []
    for anime in anime_list:
        genres = ', '.join(g.name for g in anime.genres.all())
        status_str = 'онгоинг' if anime.ongoing else 'завершён'
        anime_catalog.append(
            f'- {anime.title} ({anime.release_year}, {anime.episodes} эп., {status_str})'
            f' | Жанры: {genres} | {anime.description[:120]}...'
        )

    catalog_text = '\n'.join(anime_catalog) if anime_catalog else 'Каталог пуст.'

    system_prompt = (
        'Ты — AniBot, ИИ-ассистент сайта Applevein. '
        'Отвечай ТОЛЬКО по аниме, которые есть в каталоге ниже. '
        'Если пользователь спрашивает про аниме, которого нет в каталоге — вежливо скажи, '
        'что такого аниме нет на сайте, и предложи что-то из каталога. '
        'Не придумывай аниме, не упоминай тайтлы вне каталога. '
        'Отвечай кратко и по делу на русском языке.\n\n'
        f'=== КАТАЛОГ АНИМЕ НА САЙТЕ ===\n{catalog_text}\n=== КОНЕЦ КАТАЛОГА ==='
    )

    try:
        messages = [{'role': 'system', 'content': system_prompt}] + history
        response = http_requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
            },
            json={
                'model': 'llama-3.1-8b-instant',
                'messages': messages,
                'max_tokens': 400,
                'temperature': 0.7,
            },
            timeout=15
        )
        data = response.json()
        reply = data['choices'][0]['message']['content']
        return Response({'reply': reply})
    except Exception as e:
        return Response({'reply': f'Ошибка ИИ: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ───── АНИМЕ CBV ─────

class AnimeListCreateAPIView(ListCreateAPIView):
    queryset = Anime.objects.all()
    serializer_class = AnimeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['ongoing', 'release_year', 'genres']
    search_fields = ['title', 'description']
    ordering_fields = ['release_year', 'episodes']


class AnimeDetailAPIView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_object(self, pk):
        try:
            return Anime.objects.get(pk=pk)
        except Anime.DoesNotExist:
            return None

    def get(self, request, pk):
        anime = self.get_object(pk)
        if anime is None:
            return Response({'error': 'Anime not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = AnimeSerializer(anime)
        return Response(serializer.data)

    def put(self, request, pk):
        anime = self.get_object(pk)
        if anime is None:
            return Response({'error': 'Anime not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = AnimeSerializer(anime, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        anime = self.get_object(pk)
        if anime is None:
            return Response({'error': 'Anime not found'}, status=status.HTTP_404_NOT_FOUND)
        anime.delete()
        return Response({'message': 'Anime deleted'}, status=status.HTTP_204_NO_CONTENT)
