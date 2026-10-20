import {LocalizedText, LocalizedElement} from "@/components/Localized";
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import SEO from "@/components/SEO";
import { useLang } from "@/i18n/LangContext";
import { makeRoutes } from "@/lib/routes";

const NotFound = () => {
  const location = useLocation();
  const { lang } = useLang();
  const ROUTES = makeRoutes(lang);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <SEO title="Page not found | HORIZON OOH" description="This page is unavailable." robots="noindex, follow" />
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4"><LocalizedText>404</LocalizedText></h1>
        <p className="text-xl text-gray-600 mb-4"><LocalizedText>Oops! Page not found</LocalizedText></p>
        <LocalizedElement as={Link} to={ROUTES.HOME} className="text-blue-500 hover:text-blue-700 underline"><LocalizedText>
          Return to Home
        </LocalizedText></LocalizedElement>
      </div>
    </div>
  );
};

export default NotFound;
