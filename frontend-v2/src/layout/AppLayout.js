import React from "react";
import Head from "next/head";

export const AppLayout = ({ children }) => {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" id="favicon" href="/logo.png" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        />
        <meta name="theme-color" content="#258cf4" />
        <meta
          name="description"
          content="Compare the stuff you needed all over the internet and get the best deal"
        />
        <meta name="title" content="Comparable" />
        <meta
          name="og:title"
          content="Comparable - a single place to compare all platforms"
        />
        <meta
          name="og:description"
          content="Compare the stuff you needed all over the internet and get the best deal"
        />
        <meta name="og:image" content="/logo.png" />

        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
      </Head>

      {children}
    </>
  );
};
