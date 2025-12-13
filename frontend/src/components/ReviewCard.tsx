import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, ThumbsUp, MessageSquare, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export interface Review {
  id: string;
  author: string;
  authorInitials: string;
  role: string;
  rating: number;
  date: string;
  content: string;
  helpful: number;
  verified: boolean;
  replies?: Reply[];
}

interface Reply {
  id: string;
  author: string;
  authorInitials: string;
  date: string;
  content: string;
}

interface ReviewCardProps {
  review: Review;
  onReply?: (reviewId: string, content: string) => void;
  onHelpful?: (reviewId: string) => void;
  showReplyButton?: boolean;
}

// export const ReviewCard = ({ review, onReply, onHelpful, showReplyButton = true }: ReviewCardProps) => {
//   const [isReplying, setIsReplying] = useState(false);
//   const [replyContent, setReplyContent] = useState("");
//   const [showReplies, setShowReplies] = useState(false);

//   const handleReply = () => {
//     if (replyContent.trim() && onReply) {
//       onReply(review.id, replyContent);
//       setReplyContent("");
//       setIsReplying(false);
//       setShowReplies(true);
//     }
//   };

//   return (
//     <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary">
//       <CardContent className="pt-6">
//         {/* Header */}
//         <div className="flex items-start justify-between mb-4">
//           <div className="flex items-start gap-4 flex-1">
//             <Avatar className="w-12 h-12 ring-2 ring-primary/20">
//               <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
//                 {review.authorInitials}
//               </AvatarFallback>
//             </Avatar>
//             <div className="flex-1">
//               <div className="flex items-center gap-2 mb-1">
//                 <h4 className="font-semibold text-base">{review.author}</h4>
//                 {review.verified && (
//                   <Badge variant="secondary" className="text-xs">
//                     Verified Client
//                   </Badge>
//                 )}
//               </div>
//               <p className="text-sm text-muted-foreground">{review.role}</p>
//               <p className="text-xs text-muted-foreground mt-1">{review.date}</p>
//             </div>
//           </div>
//           <div className="flex flex-col items-end gap-2">
//             <div className="flex items-center gap-1">
//               {[...Array(5)].map((_, i) => (
//                 <Star
//                   key={i}
//                   className={`h-4 w-4 ${
//                     i < review.rating
//                       ? "fill-yellow-500 text-yellow-500"
//                       : "text-gray-300 dark:text-gray-600"
//                   }`}
//                 />
//               ))}
//             </div>
//             <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-500">
//               {review.rating}.0
//             </span>
//           </div>
//         </div>

//         {/* Review Content */}
//         <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed mb-4">
//           {review.content}
//         </p>

//         {/* Actions */}
//         <div className="flex items-center gap-4 mb-2">
//           <Button
//             variant="ghost"
//             size="sm"
//             className="gap-2 hover:bg-primary/10"
//             onClick={() => onHelpful?.(review.id)}
//           >
//             <ThumbsUp className="h-4 w-4" />
//             <span className="text-xs">Helpful ({review.helpful})</span>
//           </Button>
//           {showReplyButton && (
//             <Button
//               variant="ghost"
//               size="sm"
//               className="gap-2 hover:bg-primary/10"
//               onClick={() => setIsReplying(!isReplying)}
//             >
//               <MessageSquare className="h-4 w-4" />
//               <span className="text-xs">Reply</span>
//             </Button>
//           )}
//           {review.replies && review.replies.length > 0 && (
//             <Button
//               variant="ghost"
//               size="sm"
//               className="gap-2 hover:bg-primary/10"
//               onClick={() => setShowReplies(!showReplies)}
//             >
//               <MessageSquare className="h-4 w-4" />
//               <span className="text-xs">
//                 {showReplies ? "Hide" : "View"} {review.replies.length} {review.replies.length === 1 ? "Reply" : "Replies"}
//               </span>
//             </Button>
//           )}
//           <Button variant="ghost" size="sm" className="gap-2 hover:bg-destructive/10 ml-auto">
//             <Flag className="h-4 w-4" />
//             <span className="text-xs">Report</span>
//           </Button>
//         </div>

//         {/* Reply Input */}
//         {isReplying && (
//           <div className="mt-4 pl-16 animate-fade-in">
//             <Textarea
//               placeholder="Write your reply..."
//               value={replyContent}
//               onChange={(e) => setReplyContent(e.target.value)}
//               className="min-h-[100px] mb-2"
//             />
//             <div className="flex gap-2 justify-end">
//               <Button variant="ghost" size="sm" onClick={() => setIsReplying(false)}>
//                 Cancel
//               </Button>
//               <Button
//                 variant="default"
//                 size="sm"
//                 onClick={handleReply}
//                 disabled={!replyContent.trim()}
//               >
//                 Post Reply
//               </Button>
//             </div>
//           </div>
//         )}

//         {/* Replies */}
//         {showReplies && review.replies && review.replies.length > 0 && (
//           <div className="mt-4 pl-16 space-y-4 animate-fade-in">
//             <Separator />
//             {review.replies.map((reply) => (
//               <div key={reply.id} className="flex gap-3">
//                 <Avatar className="w-8 h-8 ring-2 ring-accent/20">
//                   <AvatarFallback className="bg-gradient-to-br from-accent to-secondary text-accent-foreground text-xs font-semibold">
//                     {reply.authorInitials}
//                   </AvatarFallback>
//                 </Avatar>
//                 <div className="flex-1">
//                   <div className="bg-muted/50 rounded-lg p-3">
//                     <div className="flex items-center gap-2 mb-1">
//                       <span className="font-semibold text-sm">{reply.author}</span>
//                       <span className="text-xs text-muted-foreground">{reply.date}</span>
//                     </div>
//                     <p className="text-sm">{reply.content}</p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

export const ReviewCard = ({
  review,
  onReply,
  onHelpful,
  showReplyButton = true,
}: ReviewCardProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showReplies, setShowReplies] = useState(false);

  const handleReply = async () => {
    if (!replyContent.trim() || !onReply) return;
    await onReply(review.id, replyContent);
    setReplyContent("");
    setIsReplying(false);
    setShowReplies(true);
  };

  const handleHelpful = async () => {
    if (!onHelpful) return;
    await onHelpful(review.id);
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary">
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            <Avatar className="w-12 h-12 ring-2 ring-primary/20">
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
                {review.authorInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-base">{review.author}</h4>
              </div>
              <p className="text-sm text-muted-foreground">{review.role}</p>
              <p className="text-xs text-muted-foreground mt-1">{review.date}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-500">
              {review.rating}.0
            </span>
          </div>
        </div>

        {/* Review Content */}
        <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed mb-4">{review.content}</p>

        {/* Actions */}
        <div className="flex items-center gap-4 mb-2">
          <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10" onClick={handleHelpful}>
            <ThumbsUp className="h-4 w-4" />
            <span className="text-xs">Helpful ({review.helpful})</span>
          </Button>
          {showReplyButton && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 hover:bg-primary/10"
              onClick={() => setIsReplying(!isReplying)}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="text-xs">Reply</span>
            </Button>
          )}
          {review.replies && review.replies.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 hover:bg-primary/10"
              onClick={() => setShowReplies(!showReplies)}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="text-xs">
                {showReplies ? "Hide" : "View"} {review.replies.length} {review.replies.length === 1 ? "Reply" : "Replies"}
              </span>
            </Button>
          )}
        </div>

        {/* Reply Input */}
        {isReplying && (
          <div className="mt-4 pl-16 animate-fade-in">
            <Textarea
              placeholder="Write your reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[100px] mb-2"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setIsReplying(false)}>
                Cancel
              </Button>
              <Button variant="default" size="sm" onClick={handleReply} disabled={!replyContent.trim()}>
                Post Reply
              </Button>
            </div>
          </div>
        )}

        {/* Replies */}
        {showReplies && review.replies && review.replies.length > 0 && (
          <div className="mt-4 pl-16 space-y-4 animate-fade-in">
            <Separator />
            {review.replies.map((reply) => (
              <div key={reply.id} className="flex gap-3">
                <Avatar className="w-8 h-8 ring-2 ring-accent/20">
                  <AvatarFallback className="bg-gradient-to-br from-accent to-secondary text-accent-foreground text-xs font-semibold">
                    {reply.authorInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{reply.author}</span>
                      <span className="text-xs text-muted-foreground">{reply.date}</span>
                    </div>
                    <p className="text-sm">{reply.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
