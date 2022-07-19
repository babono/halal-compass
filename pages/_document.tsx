import Document, { Html, Head, Main, NextScript } from 'next/document'
import React from "react";

export default class MyDocument extends Document {
  render() {
	return (
	  <Html>
		<Head>
		  {/* Global Site Tag (gtag.js) - Google Analytics */}
		  <script
			async
			src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
		  />
		  <script
			dangerouslySetInnerHTML={{
			  __html: `
			window.dataLayer = window.dataLayer || [];
			function gtag(){dataLayer.push(arguments);}
			gtag('js', new Date());
			gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
			  page_path: window.location.pathname,
			});
		  `,
			}}
		  />
			<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
		</Head>
		<body>
		  <Main />
		  <NextScript />
		</body>
	  </Html>
	)
  }
}
