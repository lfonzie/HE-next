import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageCircle, 
  Users, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Reply, 
  Share2, 
  Flag, 
  MoreHorizontal,
  Search,
  Filter,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Award,
  TrendingUp,
  BookOpen,
  Lightbulb,
  Target,
  Zap
} from 'lucide-react';

// Types for community forums
interface Forum {
  id: string;
  name: string;
  description: string;
  category: 'general' | 'academic' | 'study_groups' | 'projects' | 'announcements';
  icon: string;
  color: string;
  memberCount: number;
  postCount: number;
  lastActivity: string;
  rules: ForumRule[];
  moderators: string[];
  isPrivate: boolean;
  tags: string[];
}

interface ForumRule {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: PostAuthor;
  forumId: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
  isAnnouncement: boolean;
  views: number;
  likes: number;
  dislikes: number;
  replies: Reply[];
  attachments: PostAttachment[];
  poll?: PostPoll;
  status: 'published' | 'draft' | 'archived' | 'deleted';
}

interface PostAuthor {
  id: string;
  name: string;
  avatar: string;
  role: 'student' | 'teacher' | 'moderator' | 'admin';
  badges: UserBadge[];
  reputation: number;
  joinDate: string;
}

interface UserBadge {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

interface Reply {
  id: string;
  content: string;
  author: PostAuthor;
  createdAt: string;
  updatedAt: string;
  likes: number;
  dislikes: number;
  isSolution: boolean;
  parentId?: string; // For nested replies
  attachments: PostAttachment[];
}

interface PostAttachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'video' | 'audio' | 'link';
  url: string;
  size: number;
  uploadedAt: string;
}

interface PostPoll {
  id: string;
  question: string;
  options: PollOption[];
  allowMultiple: boolean;
  expiresAt?: string;
  totalVotes: number;
}

interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[];
}

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  maxMembers: number;
  currentMembers: number;
  members: StudyGroupMember[];
  schedule: StudyGroupSchedule[];
  goals: string[];
  resources: StudyGroupResource[];
  isPrivate: boolean;
  createdBy: string;
  createdAt: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
}

interface StudyGroupMember {
  id: string;
  name: string;
  avatar: string;
  role: 'leader' | 'member' | 'observer';
  joinDate: string;
  contribution: number;
}

interface StudyGroupSchedule {
  id: string;
  day: string;
  time: string;
  duration: number;
  type: 'study_session' | 'discussion' | 'quiz' | 'project';
  description: string;
}

interface StudyGroupResource {
  id: string;
  name: string;
  type: 'document' | 'video' | 'link' | 'quiz';
  url: string;
  description: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface AIFacilitation {
  id: string;
  type: 'moderation' | 'content_suggestion' | 'study_plan' | 'quiz_generation';
  prompt: string;
  response: string;
  confidence: number;
  timestamp: string;
  context: Record<string, any>;
}

// Community Forums Hook
export function useCommunityForums() {
  const [forums, setForums] = useState<Forum[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedForum, setSelectedForum] = useState<string | null>(null);

  // Fetch forums
  const fetchForums = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/community/forums');
      if (!response.ok) {
        throw new Error('Failed to fetch forums');
      }

      const data = await response.json();
      setForums(data.forums || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch forums');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch posts
  const fetchPosts = useCallback(async (forumId?: string) => {
    try {
      setLoading(true);
      setError(null);

      const url = forumId 
        ? `/api/community/posts?forumId=${forumId}`
        : '/api/community/posts';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      setPosts(data.posts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch study groups
  const fetchStudyGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/community/study-groups');
      if (!response.ok) {
        throw new Error('Failed to fetch study groups');
      }

      const data = await response.json();
      setStudyGroups(data.studyGroups || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch study groups');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create post
  const createPost = useCallback(async (postData: Partial<Post>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const newPost = await response.json();
      setPosts(prev => [newPost.post, ...prev]);
      return newPost.post;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create study group
  const createStudyGroup = useCallback(async (groupData: Partial<StudyGroup>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/community/study-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData),
      });

      if (!response.ok) {
        throw new Error('Failed to create study group');
      }

      const newGroup = await response.json();
      setStudyGroups(prev => [newGroup.studyGroup, ...prev]);
      return newGroup.studyGroup;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create study group');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Join study group
  const joinStudyGroup = useCallback(async (groupId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/community/study-groups/${groupId}/join`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to join study group');
      }

      // Refresh study groups
      await fetchStudyGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join study group');
    } finally {
      setLoading(false);
    }
  }, [fetchStudyGroups]);

  // Filtered forums
  const filteredForums = useMemo(() => {
    let filtered = forums;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(forum => forum.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(forum => 
        forum.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        forum.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        forum.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  }, [forums, selectedCategory, searchQuery]);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    let filtered = posts;

    if (selectedForum) {
      filtered = filtered.filter(post => post.forumId === selectedForum);
    }

    if (searchQuery) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [posts, selectedForum, searchQuery]);

  // Load data on mount
  useEffect(() => {
    fetchForums();
    fetchPosts();
    fetchStudyGroups();
  }, [fetchForums, fetchPosts, fetchStudyGroups]);

  return {
    forums: filteredForums,
    posts: filteredPosts,
    studyGroups,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedForum,
    setSelectedForum,
    createPost,
    createStudyGroup,
    joinStudyGroup,
    fetchForums,
    fetchPosts,
    fetchStudyGroups,
  };
}

// Forum Component
interface ForumProps {
  forum: Forum;
  onSelect?: (forum: Forum) => void;
}

export function Forum({ forum, onSelect }: ForumProps) {
  const handleSelect = useCallback(() => {
    onSelect?.(forum);
  }, [forum, onSelect]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general': return 'bg-blue-100 text-blue-800';
      case 'academic': return 'bg-green-100 text-green-800';
      case 'study_groups': return 'bg-purple-100 text-purple-800';
      case 'projects': return 'bg-orange-100 text-orange-800';
      case 'announcements': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleSelect}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${forum.color}`}>
              <span className="text-lg">{forum.icon}</span>
            </div>
            <div>
              <CardTitle className="text-lg">{forum.name}</CardTitle>
              <p className="text-sm text-gray-600">{forum.description}</p>
            </div>
          </div>
          <Badge className={getCategoryColor(forum.category)}>
            {forum.category.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {forum.memberCount} membros
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {forum.postCount} posts
            </div>
          </div>
          <div className="text-xs">
            {new Date(forum.lastActivity).toLocaleDateString('pt-BR')}
          </div>
        </div>
        
        {forum.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {forum.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Post Component
interface PostProps {
  post: Post;
  onReply?: (post: Post) => void;
  onLike?: (post: Post) => void;
  onShare?: (post: Post) => void;
  onReport?: (post: Post) => void;
}

export function Post({ post, onReply, onLike, onShare, onReport }: PostProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  const handleLike = useCallback(() => {
    if (isDisliked) {
      setIsDisliked(false);
    }
    setIsLiked(!isLiked);
    onLike?.(post);
  }, [isLiked, isDisliked, post, onLike]);

  const handleDislike = useCallback(() => {
    if (isLiked) {
      setIsLiked(false);
    }
    setIsDisliked(!isDisliked);
  }, [isLiked, isDisliked]);

  const handleReply = useCallback(() => {
    onReply?.(post);
  }, [post, onReply]);

  const handleShare = useCallback(() => {
    onShare?.(post);
  }, [post, onShare]);

  const handleReport = useCallback(() => {
    onReport?.(post);
  }, [post, onReport]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      case 'teacher': return 'bg-green-100 text-green-800';
      case 'student': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={`${post.isPinned ? 'border-yellow-300 bg-yellow-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{post.author.name}</span>
                <Badge className={getRoleColor(post.author.role)}>
                  {post.author.role}
                </Badge>
                {post.author.badges.map(badge => (
                  <Badge key={badge.id} variant="outline" className="text-xs">
                    {badge.icon} {badge.name}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
                <span>•</span>
                <span>{post.views} visualizações</span>
                <span>•</span>
                <span>{post.author.reputation} pontos</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {post.isPinned && (
              <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                <Star className="w-3 h-3 mr-1" />
                Fixado
              </Badge>
            )}
            {post.isLocked && (
              <Badge variant="outline" className="text-red-600 border-red-300">
                <AlertCircle className="w-3 h-3 mr-1" />
                Bloqueado
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={handleReport}>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
          <div className="prose prose-sm max-w-none">
            <p>{post.content}</p>
          </div>
        </div>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {post.attachments.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Anexos:</h4>
            <div className="flex flex-wrap gap-2">
              {post.attachments.map(attachment => (
                <div key={attachment.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm">{attachment.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {attachment.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={isLiked ? 'text-blue-600' : ''}
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              {post.likes + (isLiked ? 1 : 0)}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDislike}
              className={isDisliked ? 'text-red-600' : ''}
            >
              <ThumbsDown className="w-4 h-4 mr-1" />
              {post.dislikes + (isDisliked ? 1 : 0)}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReply}>
              <Reply className="w-4 h-4 mr-1" />
              {post.replies.length} respostas
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {showReplies && post.replies.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-semibold text-sm">Respostas:</h4>
            {post.replies.map(reply => (
              <div key={reply.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <img
                  src={reply.author.avatar}
                  alt={reply.author.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{reply.author.name}</span>
                    <Badge className={getRoleColor(reply.author.role)}>
                      {reply.author.role}
                    </Badge>
                    {reply.isSolution && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Solução
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">{reply.content}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span>{new Date(reply.createdAt).toLocaleDateString('pt-BR')}</span>
                    <span>•</span>
                    <span>{reply.likes} curtidas</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {post.replies.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReplies(!showReplies)}
            className="w-full"
          >
            {showReplies ? 'Ocultar' : 'Ver'} {post.replies.length} respostas
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Study Group Component
interface StudyGroupProps {
  studyGroup: StudyGroup;
  onJoin?: (studyGroup: StudyGroup) => void;
  onView?: (studyGroup: StudyGroup) => void;
}

export function StudyGroup({ studyGroup, onJoin, onView }: StudyGroupProps) {
  const handleJoin = useCallback(() => {
    onJoin?.(studyGroup);
  }, [studyGroup, onJoin]);

  const handleView = useCallback(() => {
    onView?.(studyGroup);
  }, [studyGroup, onView]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{studyGroup.name}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{studyGroup.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(studyGroup.status)}>
              {studyGroup.status}
            </Badge>
            <Badge className={getLevelColor(studyGroup.level)}>
              {studyGroup.level}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold">Matéria:</span>
            <p className="text-gray-600">{studyGroup.subject}</p>
          </div>
          <div>
            <span className="font-semibold">Membros:</span>
            <p className="text-gray-600">
              {studyGroup.currentMembers}/{studyGroup.maxMembers}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Objetivos:</h4>
          <ul className="list-disc list-inside text-sm text-gray-600">
            {studyGroup.goals.map((goal, index) => (
              <li key={index}>{goal}</li>
            ))}
          </ul>
        </div>

        {studyGroup.schedule.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Horários:</h4>
            <div className="space-y-1">
              {studyGroup.schedule.map(schedule => (
                <div key={schedule.id} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="text-xs">
                    {schedule.day}
                  </Badge>
                  <span>{schedule.time}</span>
                  <span className="text-gray-500">•</span>
                  <span>{schedule.duration}min</span>
                  <span className="text-gray-500">•</span>
                  <span>{schedule.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleView}>
              <Eye className="w-4 h-4 mr-1" />
              Ver Detalhes
            </Button>
          </div>
          
          <Button
            onClick={handleJoin}
            disabled={studyGroup.currentMembers >= studyGroup.maxMembers}
            size="sm"
          >
            <Users className="w-4 h-4 mr-1" />
            {studyGroup.currentMembers >= studyGroup.maxMembers ? 'Lotado' : 'Participar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
