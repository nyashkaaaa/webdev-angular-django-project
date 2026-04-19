from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class Genre(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Anime(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    episodes = models.IntegerField()
    ongoing = models.BooleanField(default=True)
    image_url = models.URLField()
    release_year = models.IntegerField()
    genres = models.ManyToManyField(Genre, related_name='anime')

    def __str__(self):
        return self.title


class UserAnimeList(models.Model):
    STATUS_CHOICES = [
        ('watching', 'Watching'),
        ('completed', 'Completed'),
        ('planned', 'Planned'),
        ('dropped', 'Dropped'),
    ]

    anime = models.ForeignKey(Anime, on_delete=models.CASCADE, related_name='user_lists')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='anime_list')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    score = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(10)],
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.user.username} - {self.anime.title} - {self.status}"


class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    anime = models.ForeignKey(Anime, on_delete=models.CASCADE, related_name='reviews')
    text = models.TextField()
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        null=True,
        blank=True
    )