from rest_framework import serializers
from .models import *


#ModelSerializers
class AnimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Anime
        fields = '__all__'


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['user']


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = '__all__'


class UserAnimeListSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = UserAnimeList
        fields = '__all__'
        read_only_fields = ['user']


#Serializers
class GenreSimpleSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=100)


class AnimeSimpleSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    title = serializers.CharField(max_length=255)
    episodes = serializers.IntegerField()
    ongoing = serializers.BooleanField()
    release_year = serializers.IntegerField()