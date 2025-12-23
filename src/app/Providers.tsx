import { fr } from "@codegouvfr/react-dsfr";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { SessionProvider } from "next-auth/react";
import { type PropsWithChildren } from "react";
import { SkeletonTheme } from "react-loading-skeleton";

import { DsfrProvider } from "@/dsfr-bootstrap";

import { QueryProvider } from "./QueryProvider";

export interface ProvidersProps extends PropsWithChildren {
  lang?: string;
}

export const Providers = ({ children, lang = "fr" }: ProvidersProps) => {
  return (
    <SessionProvider refetchOnWindowFocus>
      <QueryProvider>
        <AppRouterCacheProvider>
          <DsfrProvider lang={lang}>
            <MuiDsfrThemeProvider>
              <SkeletonTheme
                baseColor={fr.colors.decisions.background.contrast.grey.default}
                highlightColor={fr.colors.decisions.background.contrast.grey.active}
                borderRadius={fr.spacing("1v")}
                duration={2}
              >
                {children}
              </SkeletonTheme>
            </MuiDsfrThemeProvider>
          </DsfrProvider>
        </AppRouterCacheProvider>
      </QueryProvider>
    </SessionProvider>
  );
};
