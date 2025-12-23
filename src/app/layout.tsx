import "./globals.scss";
import "react-loading-skeleton/dist/skeleton.css";
import Display from "@codegouvfr/react-dsfr/Display/Display";
import { SkipLinks } from "@codegouvfr/react-dsfr/SkipLinks";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { type Metadata } from "next";
import { type PropsWithChildren } from "react";

import { ClientAnimate } from "@/components/utils/ClientAnimate";
import { config } from "@/config";
import { DsfrHead, getHtmlAttributes } from "@/dsfr-bootstrap/server-only-index";

import { DefaultFooter } from "./DefaultFooter";
import { DefaultHeader } from "./DefaultHeader";
import { Providers } from "./Providers";
import styles from "./root.module.scss";
import { sharedMetadata } from "./shared-metadata";
import { SystemMessageDisplay } from "./SystemMessageDisplay";

const contentId = "content";
const footerId = "footer";

export const metadata: Metadata = {
  metadataBase: new URL(config.host),
  ...sharedMetadata,
  openGraph: {
    title: {
      default: config.brand.name,
      template: `${config.brand.name} - %s`,
    },
    ...sharedMetadata.openGraph,
  },
  title: {
    default: config.brand.name,
    template: `${config.brand.name} - %s`,
  },
};

const lang = "fr";

const RootLayout = ({ children }: PropsWithChildren) => {
  // const { groups: _groups, startups } = await gistConfigClient.getConfig();
  // const orderedStartups = await orderAndEnrichStartups(startups);

  return (
    <html lang={lang} {...getHtmlAttributes({ lang })} className={cx(styles.app, "snap-y")}>
      <head>
        <DsfrHead
          preloadFonts={[
            "Marianne-Light",
            "Marianne-Light_Italic",
            "Marianne-Regular",
            "Marianne-Regular_Italic",
            "Marianne-Medium",
            "Marianne-Medium_Italic",
            "Marianne-Bold",
            "Marianne-Bold_Italic",
          ]}
        />
      </head>
      <body>
        <Providers lang={lang}>
          <Display />
          <SkipLinks
            links={[
              {
                anchor: `#${contentId}`,
                label: "Contenu",
              },
              {
                anchor: `#${footerId}`,
                label: "Pied de page",
              },
            ]}
          />
          <div className={styles.app}>
            <DefaultHeader />
            <ClientAnimate as="main" id="content" className={styles.content}>
              {config.maintenance ? <SystemMessageDisplay code="maintenance" noRedirect /> : children}
            </ClientAnimate>
            <DefaultFooter id="footer" />
          </div>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
