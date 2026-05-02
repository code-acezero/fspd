// All demo data has been removed.
// Course content is currently not stored in the database — the courses page
// shows an empty state. Re-introduce a real `courses` table when the user
// is ready to publish course content.

export interface Course {
  id: string;
  title: string;
  titleEn: string;
  instructor: string;
  instructorEn: string;
  duration: string;
  durationEn: string;
  modules: number;
  enrolled: number;
  status: "open" | "ongoing" | "coming_soon";
  description: string;
  descriptionEn: string;
  highlights: string[];
  highlightsEn: string[];
}

export const courses: Course[] = [];
