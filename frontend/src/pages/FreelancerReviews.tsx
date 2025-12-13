import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ReviewCard, Review } from "@/components/ReviewCard";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewStats } from "@/components/ReviewStats";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@clerk/clerk-react";

// API
import {
  fetchReviewsByFreelancer,
  createReview,
  markReviewHelpful,
  addReviewReply
} from "@/lib/api";


// -------------------
// FIXED MAPPING LOGIC
// -------------------
// function mapBackendReview(review: any): Review {
//   const authorName = review.client_name || "Client";

//   return {
//     id: review.id.toString(),
//     author: authorName,
//     authorInitials: authorName
//       .split(" ")
//       .map((n: string) => n[0])
//       .join("")
//       .toUpperCase(),

//     role: "Client",
//     rating: review.rating,
//     content: review.content,
//     date: new Date(review.created_at).toLocaleDateString(),
//     helpful: review.helpful_count,
//     verified: true,

//     // FIX: Backend uses "replies" → ALWAYS an array
//     replies: Array.isArray(review.replies)
//       ? review.replies.map((reply: any) => {
//           const rAuthor = reply.author_name || "Freelancer";

//           return {
//             id: reply.id.toString(),
//             author: rAuthor,
//             authorInitials: rAuthor
//               .split(" ")
//               .map((n: string) => n[0])
//               .join("")
//               .toUpperCase(),
//             date: new Date(reply.created_at).toLocaleDateString(),
//             content: reply.content,
//           };
//         })
//       : [],
//   };
// }
function mapBackendReview(review: any): Review {
  return {
    id: review.id.toString(),
    author: review.client_name,
    authorInitials: review.client_avatar,
    role: "Client",
    rating: review.rating,
    content: review.content,
    date: new Date(review.created_at).toLocaleDateString(),
    helpful: review.helpful_count,
    verified: true,

    replies: review.replies.map((rep: any) => ({
      id: rep.id.toString(),
      author: "Freelancer",
      authorInitials: "F",
      content: rep.content,
      date: new Date(rep.created_at).toLocaleDateString(),
    })),
  };
}


const FreelancerReviews = () => {
  const { id } = useParams();
  const { getToken } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // ---------------------
  // LOAD REVIEWS PROPERLY
  // ---------------------
  useEffect(() => {
    if (!id) return;

    async function loadData() {
      try {
        setLoading(true);

        const response = await fetchReviewsByFreelancer(parseInt(id));

        console.log("Backend raw response:", response);

        const mapped = response.results.map(mapBackendReview);

        console.log("Normalized array:", mapped);

        setReviews(mapped);

      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to load reviews.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);



  // ---------------------
  // SUBMIT NEW REVIEW
  // ---------------------
  const handleSubmitReview = async (rating: number, content: string) => {
    if (!id) return;

    const trimmed = content.trim();
    if (trimmed.length < 20) {
      toast({
        title: "Error",
        description: "Review must be at least 20 characters.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = await getToken({ template: "default" });

      const created = await createReview(parseInt(id), {
        rating,
        content: trimmed,
      }, token);

      const mapped = mapBackendReview(created);
      setReviews([mapped, ...reviews]);

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });

    } catch (error: any) {
      console.error("Review error:", error);
      toast({
        title: "Error submitting review",
        description: error.message || "Unknown error",
        variant: "destructive",
      });
    }
  };


  // ---------------------
  // HELPFUL CLICK
  // ---------------------

// const handleHelpful = async (reviewId: string) => {
//   try {
//     const token = await getToken({ template: "default" });
//     const updated = await markReviewHelpful(parseInt(reviewId), token);

//     setReviews((prev) =>
//       prev.map((r) =>
//         r.id === reviewId ? { ...r, helpful: updated.helpful_count } : r
//       )
//     );
//   } catch (error) {
//     toast({
//       title: "Error",
//       description: "Failed to mark helpful",
//       variant: "destructive",
//     });
//   }
// };

const handleHelpful = async (reviewId: string) => {
  try {
    const token = await getToken({ template: "default" });
    const data = await markReviewHelpful(Number(reviewId), token);

    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, helpful: data.helpful_count }
          : r
      )
    );
  } catch (error:any) {
    toast({
      title: "Notice",
      description: error.message,
      variant: "default",
    });
  }
};




  // ---------------------
  // REPLY TO REVIEW
  // ---------------------
 
const handleReply = async (reviewId: string, content: string) => {
  try {
    const token = await getToken({ template: "default" });
    const reply = await addReviewReply(Number(reviewId), content, token);

    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              replies: [
                ...(r.replies || []),
                {
                  id: reply.id.toString(),
                  author: "You",
                  authorInitials: "Y",
                  date: new Date(reply.created_at).toLocaleDateString(),
                  content: reply.content,
                },
              ],
            }
          : r
      )
    );
  } catch (err) {
    console.error(err);
    toast({
      title: "Error",
      description: "Failed to add reply",
      variant: "destructive",
    });
  }
};



  // ---------------------
  // RENDER
  // ---------------------
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" className="mb-6 gap-2" asChild>
            <Link to={`/freelancer/${id}`}>
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Link>
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Client Reviews</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Real feedback from clients who worked with this freelancer
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* LEFT SIDE - STATS + FORM */}
            <div className="lg:col-span-1 space-y-6">
              <ReviewStats
                totalReviews={reviews.length}
                averageRating={
                  reviews.length > 0
                    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                    : 0
                }
                ratingDistribution={
                  reviews.reduce(
                    (acc, r) => {
                      acc[r.rating]++;
                      return acc;
                    },
                    { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
                  )
                }
              />

              <ReviewForm onSubmit={handleSubmitReview} />
            </div>

            {/* RIGHT SIDE - REVIEWS LIST */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-2xl font-bold mb-4">
                All Reviews ({reviews.length})
              </h2>

              {loading ? (
                <div className="py-10 text-center text-gray-500">
                  Loading reviews...
                </div>

              ) : reviews.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No reviews yet. Be the first to review!
                </div>

              ) : (
                reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onReply={handleReply}
                    onHelpful={handleHelpful}
                    showReplyButton={true}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FreelancerReviews;
