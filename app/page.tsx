import CustomAIQuizPage from "./custom-ai-quiz/page";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export default function Page() {
  return (
    <>
      <GoogleAnalytics />
      <CustomAIQuizPage />
    </>
  );
}
