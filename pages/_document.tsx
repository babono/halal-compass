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
  atOptions = {
    'key' : '0cc0eb3ff40fbc913410ef3eff2cdbac',
    'format' : 'iframe',
    'height' : 50,
    'width' : 320,
    'params' : {}
  };
  document.write('<scr' + 'ipt type="text/javascript" src="http' + (location.protocol === 'https:' ? 's' : '') + '://www.highperformancedisplayformat.com/0cc0eb3ff40fbc913410ef3eff2cdbac/invoke.js"></scr' + 'ipt>');
`,
				}}
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
		</Head>
		<body>
		  <Main />
		  <NextScript />
		</body>
	  </Html>
	)
  }
}
