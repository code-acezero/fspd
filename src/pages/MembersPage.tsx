import { useEffect, useState } from "react";
import MainNav from "@/components/MainNav";
import Footer from "@/components/landing/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import MemberCard, { type MemberCardData } from "@/components/members/MemberCard";
import EditableSection from "@/components/editor/EditableSection";
import EditableText from "@/components/editor/EditableText";

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
      <EditableSection pageKey="members" sectionKey="header" sectionTitle="সদস্য পেজ হেডার (Members Header)">
        <div className="bg-hero-gradient py-16 relative overflow-hidden">
          <div className="absolute inset-0 alpona-pattern opacity-20" />
          <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <EditableText
              pageKey="members"
              sectionKey="header"
              elementKey="title"
              defaultBn={t("allMembers") || "আমাদের সম্মানিত সদস্যবৃন্দ"}
              defaultEn="Our Honoured Members"
              as="h1"
              className="font-bengali text-3xl md:text-5xl font-bold text-primary-foreground mb-4 drop-shadow-lg block"
            />
            <EditableText
              pageKey="members"
              sectionKey="header"
              elementKey="subtitle"
              defaultBn={t("membersSubtitle") || "সাহিত্য ও সংস্কৃতি বিকাশে নিবেদিত প্রাণ লেখক, কবি ও সংগঠকবৃন্দ"}
              defaultEn="Writers, poets, and organizers dedicated to literature and culture"
              as="p"
              className="font-bengali text-primary-foreground/70 max-w-lg mx-auto block"
            />
          </div>
        </div>
      </EditableSection>

      <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {seniors.length > 0 && (
          <EditableSection pageKey="members" sectionKey="advisors" sectionTitle="উপদেষ্টা ও প্রতিষ্ঠাতা পরিষদ (Senior Advisors)">
            <EditableText
              pageKey="members"
              sectionKey="advisors"
              elementKey="title"
              defaultBn={t("seniorMembers") || "উপদেষ্টা ও প্রতিষ্ঠাতা পরিষদ"}
              defaultEn="Advisory & Founding Council"
              as="h2"
              className="font-bengali text-2xl font-bold text-foreground mb-8 text-center block"
            />
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-16 max-w-5xl mx-auto">
              {seniors.map((member, index) => (
                <MemberCard key={member.id} member={member} variant="senior" index={index} bioMaxChars={180} />
              ))}
            </div>
          </EditableSection>
        )}

        {general.length > 0 && (
          <EditableSection pageKey="members" sectionKey="general" sectionTitle="কার্যনির্বাহী ও সাধারণ পরিষদ (General Council)">
            <EditableText
              pageKey="members"
              sectionKey="general"
              elementKey="title"
              defaultBn={t("generalMembers") || "কার্যনির্বাহী ও সাধারণ সদস্যবৃন্দ"}
              defaultEn="Executive & General Members"
              as="h2"
              className="font-bengali text-2xl font-bold text-foreground mb-8 text-center block"
            />
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 max-w-4xl mx-auto">
              {general.map((member, index) => (
                <MemberCard key={member.id} member={member} variant="general" index={index} />
              ))}
            </div>
          </EditableSection>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MembersPage;
