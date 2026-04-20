import os
import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token

from .models import *
from .serializers import *


# FBV

@api_view(['GET'])
@permission_classes([AllowAny])
def genre_list(request):
    genres = Genre.objects.all()
    serializer = GenreSerializer(genres, many=True)
    return Response(serializer.data)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def user_anime_list_list(request):
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

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def review_list_create(request):
    if request.method == 'GET':
        reviews = Review.objects.all()
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_review(request, pk):
    try:
        anime = Anime.objects.get(pk=pk)
    except Anime.DoesNotExist:
        return Response({'error': 'Аниме не найдено'}, status=status.HTTP_404_NOT_FOUND)

    serializer = ReviewSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user, anime=anime)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    



# CBV
class AnimeListCreateAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        anime = Anime.objects.all()
        serializer = AnimeSerializer(anime, many=True)
        return Response(serializer.data)
    

    def post(self, request):
        serializer = AnimeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AnimeDetailAPIView(APIView):
    permission_classes = [AllowAny]

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


from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

# --- РЕГИСТРАЦИЯ ---
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': {'id': user.id, 'username': user.username},
            'token': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- ОБНОВЛЕНИЕ / УДАЛЕНИЕ ЗАПИСИ СПИСКА ---
@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def user_anime_list_detail(request, pk):
    try:
        item = UserAnimeList.objects.get(pk=pk, user=request.user)
    except UserAnimeList.DoesNotExist:
        return Response({'error': 'Не найдено'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        serializer = UserAnimeListSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# --- ОТЗЫВ К КОНКРЕТНОМУ АНИМЕ ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_review(request, pk):
    try:
        anime = Anime.objects.get(pk=pk)
    except Anime.DoesNotExist:
        return Response({'error': 'Аниме не найдено'}, status=status.HTTP_404_NOT_FOUND)

    serializer = ReviewSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user, anime=anime)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# --- ЛОГИН ---
@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    # Проверяем, есть ли такой пользователь
    user = authenticate(username=username, password=password)
    
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': {'id': user.id, 'username': user.username},
            'token': str(refresh.access_token),
            'refresh': str(refresh),
        })
    else:
        return Response({'error': 'Неверный логин или пароль'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def chat_bot(request):
    history = request.data.get('history', [])

    api_key = os.environ.get('GROQ_API_KEY', '')
    if not api_key:
        return Response({'error': 'GROQ_API_KEY not set'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    anime_qs = Anime.objects.prefetch_related('genres').all()
    catalog_lines = []
    for a in anime_qs:
        genres = ', '.join(g.name for g in a.genres.all()) or 'нет данных'
        catalog_lines.append(f"- {a.title} ({a.release_year}), жанры: {genres}, серий: {a.episodes}")
    catalog_text = '\n'.join(catalog_lines) if catalog_lines else 'каталог пуст'

    system_prompt = (
        "You are AniBot — a friendly AI assistant for an anime tracker. "
        "Always respond in English. "
        "Below is the current anime catalog on the site:\n\n"
        f"{catalog_text}\n\n"
        "Use this data to answer questions and make recommendations about the catalog."
    )

    messages = [{'role': 'system', 'content': system_prompt}] + history

    resp = requests.post(
        'https://api.groq.com/openai/v1/chat/completions',
        headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
        json={'model': 'llama-3.3-70b-versatile', 'messages': messages, 'max_tokens': 512},
        timeout=30,
    )

    if resp.status_code != 200:
        return Response({'error': resp.text}, status=status.HTTP_502_BAD_GATEWAY)

    reply = resp.json()['choices'][0]['message']['content']
    return Response({'reply': reply})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_reviews(request):
    reviews = Review.objects.filter(user=request.user)
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data)