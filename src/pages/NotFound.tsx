import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold font-bengali">404</h1>
        <p className="mb-4 text-xl text-muted-foreground font-bengali">{t("pageNotFound")}</p>
        <Link to="/" className="text-primary underline hover:text-primary/90 font-bengali">
          {t("returnHome")}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
