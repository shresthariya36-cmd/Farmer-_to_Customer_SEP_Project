import { useState } from "react";
import { api } from "../api.js";

export default function RateProduct({
    product,
    orderId,
    onSubmitted
}) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [review, setReview] = useState("");
    const [sending, setSending] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState("");

    async function submit() {
        if (rating < 1) {
            setError("Please select a rating.");
            return;
        }

        setSending(true);
        setError("");

        try {
            await api.submitReview({
                productId: product.productId || product.id,
                orderId: orderId,
                rating: rating,
                comment: review
            });

            setDone(true);

            if (onSubmitted) {
                onSubmitted();
            }
        } catch (err) {
            setError(
                err?.message ||
                "Could not submit review."
            );
        } finally {
            setSending(false);
        }
    }

    if (done) {
        return (
            <div
                style={{
                    marginTop: 15,
                    padding: 12,
                    borderRadius: 8,
                    background: "#eef8ef"
                }}
            >
                <b>✓ Thank you for your review!</b>
            </div>
        );
    }

    return (
        <div
            style={{
                marginTop: 15,
                padding: 15,
                border: "1px solid #ddd",
                borderRadius: 10
            }}
        >

            <h4>
                Rate this product
            </h4>

            <div
                style={{
                    display: "flex",
                    gap: 5,
                    margin: "10px 0"
                }}
            >
                {[1, 2, 3, 4, 5].map(
                    (star) => (
                        <button
                            key={star}
                            type="button"
                            onMouseEnter={() =>
                                setHover(star)
                            }
                            onMouseLeave={() =>
                                setHover(0)
                            }
                            onClick={() =>
                                setRating(star)
                            }
                            style={{
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                fontSize: 26,
                                padding: 2,
                                color:
                                    star <=
                                        (hover || rating)
                                        ? "#f5b301"
                                        : "#ccc"
                            }}
                        >
                            ★
                        </button>
                    )
                )}
            </div>

            <textarea
                value={review}
                onChange={(e) =>
                    setReview(e.target.value)
                }
                placeholder="Write your review..."
                style={{
                    width: "100%",
                    minHeight: 80,
                    marginBottom: 10
                }}
            />

            {error && (
                <p
                    style={{
                        color: "#B3261E",
                        fontSize: 13
                    }}
                >
                    {error}
                </p>
            )}

            <button
                className="btn btn-primary"
                onClick={submit}
                disabled={sending}
            >
                {sending
                    ? "Submitting..."
                    : "Submit Review"}
            </button>

        </div>
    );
}
