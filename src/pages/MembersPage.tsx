import { useEffect, useState } from "react";
import MainNav from "@/components/MainNav";
import Footer from "@/components/landing/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import MemberCard, { type MemberCardData } from "@/components/members/MemberCard";

interface Member extends MemberCardData {
  is_senior: boolean;
}

const MembersPage = () => {
  const { t } = useLanguage();
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("members")
        .select("*")
        .order("sort_order", { ascending: true });
      if (data) setMembers(data as Member[]);
    })();
  }, []);

  const seniors = members.filter((m) => m.is_senior);
  const general = members.filter((m) => !m.is_senior);

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <div className="bg-hero-gradient py-16 relative overflow-hidden">
        <div className="absolute inset-0 alpona-pattern opacity-20" />
        <div className="container mx-auto px-4 lg:px-8 text-center relative">
          <h1 className="font-bengali text-3xl md:text-5xl font-bold text-primary-foreground mb-4 drop-shadow-lg">{t("allMembers")}</h1>
          <p className="font-bengali text-primary-foreground/70">{t("membersSubtitle")}</p>
        </div>
      </div>
      <div className="container mx-auto px-4 lg:px-8 py-10">
        {seniors.length > 0 && (
          <>
            <h2 className="font-bengali text-2xl font-bold text-foreground mb-8 text-center">{t("seniorMembers")}</h2>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-16 max-w-5xl mx-auto">
              {seniors.map((member, index) => (
                <MemberCard key={member.id} member={member} variant="senior" index={index} bioMaxChars={180} />
              ))}
            </div>
          </>
        )}
        {general.length > 0 && (
          <>
            <h2 className="font-bengali text-2xl font-bold text-foreground mb-8 text-center">{t("generalMembers")}</h2>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 max-w-4xl mx-auto">
              {general.map((member, index) => (
                <MemberCard key={member.id} member={member} variant="general" index={index} />
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MembersPage;
