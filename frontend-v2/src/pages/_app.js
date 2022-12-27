import React from "react";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";

import { AppLayout } from "layout/AppLayout";

import store from "store";
import "styles/global.scss";

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 5000,
        }}
      />
      <AppLayout>
        <Component {...pageProps} />
      </AppLayout>
    </Provider>
  );
}

export default MyApp;
