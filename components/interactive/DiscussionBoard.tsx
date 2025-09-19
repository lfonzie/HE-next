'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageCircle, Send, ThumbsUp, ThumbsDown, Reply, Flag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface DiscussionPost {
  id: string
  author: string
  avatar?: string
  content: string
  timestamp: Date
  likes: number
  dislikes: number
  replies: DiscussionPost[]
  isTeacher?: boolean
}

interface DiscussionBoardProps {
  prompts: string[]
  realTime?: boolean
  allowReplies?: boolean
  showLikes?: boolean
  moderationEnabled?: boolean
  onPost?: (post: DiscussionPost) => void
  onLike?: (postId: string) => void
  onReply?: (postId: string, reply: string) => void
}

export default function DiscussionBoard({
  prompts,
  realTime = false,
  allowReplies = true,
  showLikes = true,
  moderationEnabled = false,
  onPost,
  onLike,
  onReply
}: DiscussionBoardProps) {
  const [posts, setPosts] = useState<DiscussionPost[]>([])
  const [newPost, setNewPost] = useState('')
  const [selectedPrompt, setSelectedPrompt] = useState(0)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Simulate real-time updates
  useEffect(() => {
    if (realTime) {
      const interval = setInterval(() => {
        // Simulate new posts from other students
        if (Math.random() < 0.1) { // 10% chance every 5 seconds
          const samplePosts = [
            "Concordo com essa perspectiva!",
            "Que interessante, nunca tinha pensado nisso assim.",
            "Posso adicionar que...",
            "Excelente ponto! Isso me lembra de...",
            "Tenho uma dúvida sobre isso..."
          ]
          
          const newPost: DiscussionPost = {
            id: `post_${typeof window !== 'undefined' ? Date.now() : 0}_${typeof window !== 'undefined' ? Math.random().toString(36).substr(2, 9) : 'server'}`,
            author: `Estudante ${typeof window !== 'undefined' ? Math.floor(Math.random() * 20) + 1 : 1}`,
            content: samplePosts[typeof window !== 'undefined' ? Math.floor(Math.random() * samplePosts.length) : 0],
            timestamp: new Date(),
            likes: typeof window !== 'undefined' ? Math.floor(Math.random() * 10) : 0,
            dislikes: typeof window !== 'undefined' ? Math.floor(Math.random() * 3) : 0,
            replies: [],
            isTeacher: typeof window !== 'undefined' ? Math.random() < 0.1 : false // 10% chance of being a teacher
          }
          
          setPosts(prev => [newPost, ...prev])
        }
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [realTime])

  const handleSubmitPost = async () => {
    if (!newPost.trim() || isSubmitting) return

    setIsSubmitting(true)
    
    const post: DiscussionPost = {
      id: `post_${typeof window !== 'undefined' ? Date.now() : 0}_${typeof window !== 'undefined' ? Math.random().toString(36).substr(2, 9) : 'server'}`,
      author: 'Você',
      content: newPost.trim(),
      timestamp: new Date(),
      likes: 0,
      dislikes: 0,
      replies: [],
      isTeacher: false
    }

    setPosts(prev => [post, ...prev])
    setNewPost('')
    setIsSubmitting(false)
    
    onPost?.(post)
  }

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ))
    onLike?.(postId)
  }

  const handleDislike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, dislikes: post.dislikes + 1 }
        : post
    ))
  }

  const handleReply = async (postId: string) => {
    if (!replyContent.trim()) return

    const reply: DiscussionPost = {
      id: `reply_${typeof window !== 'undefined' ? Date.now() : 0}_${typeof window !== 'undefined' ? Math.random().toString(36).substr(2, 9) : 'server'}`,
      author: 'Você',
      content: replyContent.trim(),
      timestamp: new Date(),
      likes: 0,
      dislikes: 0,
      replies: [],
      isTeacher: false
    }

    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, replies: [...post.replies, reply] }
        : post
    ))
    
    setReplyContent('')
    setReplyingTo(null)
    onReply?.(postId, replyContent.trim())
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Agora mesmo'
    if (minutes < 60) return `${minutes}m atrás`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h atrás`
    return date.toLocaleDateString()
  }

  const renderPost = (post: DiscussionPost, isReply = false) => (
    <motion.div
      key={post.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isReply ? 'ml-8 mt-3' : 'mb-4'}`}
    >
      <Card className={`${isReply ? 'border-l-4 border-l-blue-200' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.avatar} />
              <AvatarFallback>
                {post.author.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm">{post.author}</span>
                {post.isTeacher && (
                  <Badge variant="secondary" className="text-xs">
                    Professor
                  </Badge>
                )}
                <span className="text-xs text-gray-500">
                  {formatTime(post.timestamp)}
                </span>
              </div>
              
              <p className="text-sm mb-3">{post.content}</p>
              
              <div className="flex items-center gap-4">
                {showLikes && (
                  <>
                    <Button
                      onClick={() => handleLike(post.id)}
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      {post.likes}
                    </Button>
                    <Button
                      onClick={() => handleDislike(post.id)}
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                    >
                      <ThumbsDown className="h-3 w-3 mr-1" />
                      {post.dislikes}
                    </Button>
                  </>
                )}
                
                {allowReplies && !isReply && (
                  <Button
                    onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    Responder
                  </Button>
                )}
                
                {moderationEnabled && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-red-600 hover:text-red-700"
                  >
                    <Flag className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              {/* Reply Form */}
              {replyingTo === post.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t"
                >
                  <Textarea
                    ref={textareaRef}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Escreva sua resposta..."
                    className="mb-2"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleReply(post.id)}
                      size="sm"
                      disabled={!replyContent.trim()}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Enviar
                    </Button>
                    <Button
                      onClick={() => {
                        setReplyingTo(null)
                        setReplyContent('')
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Cancelar
                    </Button>
                  </div>
                </motion.div>
              )}
              
              {/* Replies */}
              <AnimatePresence>
                {post.replies.map(reply => renderPost(reply, true))}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Fórum de Discussão
          {realTime && (
            <Badge variant="secondary" className="text-xs">
              Tempo Real
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Prompts */}
        <div className="space-y-4">
          <h3 className="font-semibold">Tópicos para Discussão:</h3>
          <div className="space-y-2">
            {prompts.map((prompt, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedPrompt === index 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPrompt(index)}
              >
                <p className="text-sm">{prompt}</p>
              </div>
            ))}
          </div>
        </div>

        {/* New Post Form */}
        <div className="space-y-3">
          <h4 className="font-medium">Compartilhe sua opinião:</h4>
          <Textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder={`Responda ao tópico: "${prompts[selectedPrompt]}"`}
            rows={3}
            className="resize-none"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {newPost.length}/500 caracteres
            </span>
            <Button
              onClick={handleSubmitPost}
              disabled={!newPost.trim() || isSubmitting}
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">
              Discussões ({posts.length})
            </h4>
            {realTime && (
              <Badge variant="outline" className="text-xs">
                🔴 Ao vivo
              </Badge>
            )}
          </div>
          
          <AnimatePresence>
            {posts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma discussão ainda. Seja o primeiro a comentar!</p>
              </div>
            ) : (
              posts.map(post => renderPost(post))
            )}
          </AnimatePresence>
        </div>

        {/* Guidelines */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h5 className="font-medium mb-2">Diretrizes da Discussão:</h5>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Seja respeitoso e construtivo</li>
            <li>• Compartilhe ideias e experiências pessoais</li>
            <li>• Faça perguntas para aprofundar o debate</li>
            <li>• Use evidências para apoiar seus argumentos</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
