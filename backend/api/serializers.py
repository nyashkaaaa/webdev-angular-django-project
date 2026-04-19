from rest_framework import serializers
from .models import *

# 1. СНАЧАЛА ОБЪЯВЛЯЕМ ПРОСТЫЕ СЕРИАЛИЗАТОРЫ (ЖАНРЫ)
class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = '__all__'

# 2. ЗАТЕМ ОТЗЫВЫ (ЧТОБЫ ИХ МОЖНО БЫЛО ВКЛЮЧИТЬ В АНИМЕ)
class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    anime = serializers.PrimaryKeyRelatedField(read_only=True)  # ← добавь это

    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['user', 'anime']  # ← добавь anime

# 3. ТЕПЕРЬ ГЛАВНЫЙ СЕРИАЛИЗАТОР АНИМЕ (ОН ИСПОЛЬЗУЕТ ПРЕДЫДУЩИЕ ДВА)
class AnimeSerializer(serializers.ModelSerializer):
    # Теперь жанры будут приходить как объекты: {id: 1, name: "Детектив"}
    genres = GenreSerializer(many=True, read_only=True)
    
    # Добавляем отзывы прямо в детали аниме (поле должно называться как related_name в модели)
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Anime
        fields = [
            'id', 'title', 'description', 'episodes', 
            'ongoing', 'image_url', 'release_year', 'genres', 'reviews'
        ]

# 4. ОСТАЛЬНЫЕ ВСПОМОГАТЕЛЬНЫЕ СЕРИАЛИЗАТОРЫ
class UserAnimeListSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    anime_detail = AnimeSerializer(source='anime', read_only=True)  # ← добавь

    class Meta:
        model = UserAnimeList
        fields = ['id', 'user', 'anime', 'anime_detail', 'status', 'score']
        read_only_fields = ['user']

# СЕКЦИЯ SIMPLE SERIALIZERS (ЕСЛИ НУЖНЫ ДЛЯ КРАТКИХ СПИСКОВ)
class GenreSimpleSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=100)

class AnimeSimpleSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    title = serializers.CharField(max_length=255)
    episodes = serializers.IntegerField()
    ongoing = serializers.BooleanField()
    release_year = serializers.IntegerField()

from django.contrib.auth.models import User

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True) # Пароль только для записи, не возвращаем его

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        # Используем create_user, чтобы пароль захешировался, а не сохранился обычным текстом
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user
    
