import type { DetailedHTMLProps, HTMLAttributes } from "react";

// JSX typing for the <iconify-icon> web component (registered at runtime by the
// `iconify-icon` package, imported in app/providers.tsx).
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "iconify-icon": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          icon?: string;
          width?: string | number;
          height?: string | number;
          inline?: boolean;
          mode?: string;
          flip?: string;
          rotate?: string | number;
        },
        HTMLElement
      >;
    }
  }
}
