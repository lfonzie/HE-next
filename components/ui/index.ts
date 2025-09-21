// Sistema Unificado de Loading - HubEdu.ia
// Este arquivo centraliza todas as exportações do sistema de loading

// Sistema principal de loading
export {
  LoadingProvider,
  useLoading,
  Spinner,
  LoadingCard,
  ProgressBar,
  useLoadingState,
  useProgressLoading,
  Skeleton,
  ChatSkeleton,
  CardSkeleton,
  LoadingButton,
  LoadingInput,
  useButtonLoading,
  useInputLoading
} from './loading';

// Basic UI Components
export { Button, buttonVariants } from './button';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card';
export { Input } from './input';
export { Label } from './label';
export { Separator } from './separator';
export { Alert, AlertDescription, AlertTitle } from './alert';
export { Badge, badgeVariants } from './badge';
export { Checkbox } from './checkbox';
export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './dropdown-menu';
export { Progress } from './progress';
export { ScrollArea, ScrollBar } from './scroll-area';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
export { Slider } from './slider';
export { Switch } from './switch';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
export { Textarea } from './textarea';
export { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from './toast';
export { Toaster } from './toaster';
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
export { Avatar, AvatarFallback, AvatarImage } from './avatar';
export { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';
