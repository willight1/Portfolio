from django.urls import path
from .views import CommentViewSet, PostViewSet, ProjectViewSet

project_list = ProjectViewSet.as_view({
    'get': 'list',
    'post': 'create',
})
project_detail_by_slug = ProjectViewSet.as_view({'get': 'retrieve'})
project_detail_by_id = ProjectViewSet.as_view({'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'})

post_list = PostViewSet.as_view({
    'get': 'list',
    'post': 'create',
})
post_detail_by_slug = PostViewSet.as_view({'get': 'retrieve'})
post_detail_by_id = PostViewSet.as_view({'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'})
post_like_toggle = PostViewSet.as_view({'post': 'toggle_like'})
post_by_author = PostViewSet.as_view({'get': 'by_author'})
post_comments = PostViewSet.as_view({'get': 'comments', 'post': 'comments'})
comment_detail_by_id = CommentViewSet.as_view({'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'})
comment_like_toggle = CommentViewSet.as_view({'post': 'toggle_like'})

urlpatterns = [
    path('projects/', project_list, name='project-list'),
    path('projects/<int:pk>/', project_detail_by_id, name='project-detail-id'),
    path('projects/<slug:slug>/', project_detail_by_slug, name='project-detail-slug'),

    path('posts/', post_list, name='post-list'),
    path('posts/author/<str:username>/', post_by_author, name='post-by-author'),
    path('posts/<int:pk>/', post_detail_by_id, name='post-detail-id'),
    path('posts/<int:pk>/like/', post_like_toggle, name='post-like-toggle'),
    path('posts/<int:pk>/comments/', post_comments, name='post-comments'),
    path('posts/<slug:slug>/', post_detail_by_slug, name='post-detail-slug'),
    path('comments/<int:pk>/', comment_detail_by_id, name='comment-detail-id'),
    path('comments/<int:pk>/like/', comment_like_toggle, name='comment-like-toggle'),
]
