from rest_framework import serializers
from .models import *

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    anime = serializers.PrimaryKeyRelatedField(read_only=True)  # ← добавь это

    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['user', 'anime']  # ← добавь anime

class AnimeSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True, read_only=True)
    
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Anime
        fields = [
            'id', 'title', 'description', 'episodes', 
            'ongoing', 'image_url', 'release_year', 'genres', 'reviews'
        ]

class UserAnimeListSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    anime_detail = AnimeSerializer(source='anime', read_only=True)  # ← добавь

    class Meta:
        model = UserAnimeList
        fields = ['id', 'user', 'anime', 'anime_detail', 'status', 'score']
        read_only_fields = ['user']

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
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user
    
class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Profile
        fields = ['username', 'avatar', 'bio', 'level']
