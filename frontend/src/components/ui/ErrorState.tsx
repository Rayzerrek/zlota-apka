import { type ApiError, apiErrorMessage } from "../../lib/error";

type Tone = "inline" | "banner";

type Props = {
  error: ApiError | Error | string;
  tone?: Tone;
  className?: string;
};

function resolveMessage(error: Props["error"]): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return apiErrorMessage(error);
}

export function ErrorState({ error, tone = "banner", className }: Props) {
  const message = resolveMessage(error);

  if (tone === "inline") {
    return (
      <p
        className={`text-[13px] text-rating-1 ${className ?? ""}`}
        role="alert"
      >
        {message}
      </p>
    );
  }

  return (
    <div
      role="alert"
      className={`rounded-sm border border-rating-1/25 bg-rating-1/8 p-4 text-[15px] text-rating-1 ${className ?? ""}`}
    >
      {message}
    </div>
  );
}
