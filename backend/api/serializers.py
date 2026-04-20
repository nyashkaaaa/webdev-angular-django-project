from rest_framework import serializers
from .models import *

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    anime = serializers.PrimaryKeyRelatedField(read_only=True)
    anime_detail = serializers.SerializerMethodField()

    def get_anime_detail(self, obj):
        if obj.anime:
            return {'id': obj.anime.id, 'title': obj.anime.title}
        return None

    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['user', 'anime']

class AnimeSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    avg_rating = serializers.SerializerMethodField()

    def get_avg_rating(self, obj):
        ratings = [r.rating for r in obj.reviews.all() if r.rating is not None]
        if not ratings:
            return None
        return round(sum(ratings) / len(ratings), 1)

    class Meta:
        model = Anime
        fields = [
            'id', 'title', 'description', 'episodes',
            'ongoing', 'image_url', 'release_year', 'genres', 'reviews', 'avg_rating'
        ]

class UserAnimeListSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    anime_detail = AnimeSerializer(source='anime', read_only=True)

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
    password = serializers.CharField(write_only=True)

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
    
