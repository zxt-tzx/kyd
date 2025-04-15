import { type SVGProps } from "react";
import { siX } from "simple-icons";

export const XTwitterIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    dangerouslySetInnerHTML={{ __html: siX.svg }}
    fill="currentColor"
    {...props}
  />
);
