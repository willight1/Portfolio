from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Comment, CommentLike, Post, PostLike, Project
from .permissions import IsAdminReadLoginRetrieve, IsAuthorOrStaffOrReadOnly
from .serializers import CommentSerializer, PostSerializer, ProjectSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAdminReadLoginRetrieve]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    lookup_field = 'slug'

    def get_object(self):
        # 상세 조회는 slug로, 수정/삭제는 id로 둘 다 지원
        if self.action in ['update', 'partial_update', 'destroy']:
            return get_object_or_404(Project, id=self.kwargs.get('pk'))
        return super().get_object()


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.select_related('created_by').all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthorOrStaffOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    lookup_field = 'slug'

    def get_object(self):
        # 상세 조회는 slug로, 수정/삭제/좋아요는 id 사용
        if self.action in ['update', 'partial_update', 'destroy']:
            return get_object_or_404(Post, id=self.kwargs.get('pk'))
        return super().get_object()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get', 'post'], permission_classes=[AllowAny], url_path='comments')
    def comments(self, request, *args, **kwargs):
        post = get_object_or_404(Post, id=kwargs.get('pk'))

        if request.method == 'GET':
            queryset = post.comments.select_related('user').all()
            serializer = CommentSerializer(queryset, many=True, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)

        if not request.user.is_authenticated:
            return Response({'detail': '로그인이 필요합니다.'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = CommentSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save(post=post, user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def by_author(self, request, username=None):
        queryset = self.get_queryset().filter(created_by__username=username)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], url_path='like')
    def toggle_like(self, request, *args, **kwargs):
        post = get_object_or_404(Post, id=kwargs.get('pk'))
        like, created = PostLike.objects.get_or_create(post=post, user=request.user)

        if created:
            liked = True
            detail = 'Liked'
        else:
            like.delete()
            liked = False
            detail = 'Unliked'

        return Response(
            {
                'detail': detail,
                'liked': liked,
                'likes_count': post.likes.count(),
            },
            status=status.HTTP_200_OK,
        )


class CommentViewSet(viewsets.GenericViewSet):
    queryset = Comment.objects.select_related('user', 'post').all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, pk=None):
        comment = get_object_or_404(Comment, id=pk)
        if not (request.user.is_staff or comment.user_id == request.user.id):
            return Response({'detail': '권한이 없습니다.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = CommentSerializer(comment, data=request.data, partial=False, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def partial_update(self, request, pk=None):
        comment = get_object_or_404(Comment, id=pk)
        if not (request.user.is_staff or comment.user_id == request.user.id):
            return Response({'detail': '권한이 없습니다.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = CommentSerializer(comment, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, pk=None):
        comment = get_object_or_404(Comment, id=pk)
        if not (request.user.is_staff or comment.user_id == request.user.id):
            return Response({'detail': '권한이 없습니다.'}, status=status.HTTP_403_FORBIDDEN)
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], url_path='like')
    def toggle_like(self, request, pk=None):
        comment = get_object_or_404(Comment, id=pk)
        like, created = CommentLike.objects.get_or_create(comment=comment, user=request.user)
        if created:
            liked = True
            detail = 'Liked'
        else:
            like.delete()
            liked = False
            detail = 'Unliked'

        return Response(
            {'detail': detail, 'liked': liked, 'likes_count': comment.likes.count()},
            status=status.HTTP_200_OK,
        )
