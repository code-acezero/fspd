import { useSeo } from "@/hooks/useSeo";

interface Props {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
}

/** Declarative wrapper around `useSeo` so pages can drop <SeoHead /> in JSX. */
const SeoHead = (props: Props) => {
  useSeo(props);
  return null;
};

export default SeoHead;
