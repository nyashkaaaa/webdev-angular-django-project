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
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate

# --- РЕГИСТРАЦИЯ ---
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # Создаем токен для нового пользователя
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'user': {'id': user.id, 'username': user.username},
            'token': token.key
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
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'user': {'id': user.id, 'username': user.username},
            'token': token.key
        })
    else:
        return Response({'error': 'Неверный логин или пароль'}, status=status.HTTP_400_BAD_REQUEST)
    

# Добавь это в views.py

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile_detail(request):
    profile = request.user.profile
    
    if request.method == 'GET':
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)
    
    elif request.method == 'PATCH':
        # partial=True позволяет обновлять только ник или только аватар
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_reviews(request):
    # Получаем только отзывы текущего пользователя
    reviews = Review.objects.filter(user=request.user)
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data)