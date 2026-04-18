from django.urls import path
from .views import (
    genre_list,
    review_list_create,
    user_anime_list,
    user_anime_list_detail,
    AnimeListCreateAPIView,
    AnimeDetailAPIView,
    register,
    google_auth,
    chat_bot,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', register),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('auth/google/', google_auth),

    path('genres/', genre_list),
    path('reviews/', review_list_create),
    path('my-list/', user_anime_list),
    path('my-list/<int:pk>/', user_anime_list_detail),
    path('anime/', AnimeListCreateAPIView.as_view()),
    path('anime/<int:pk>/', AnimeDetailAPIView.as_view()),

    path('chat/', chat_bot),
]
