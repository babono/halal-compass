import { useRouter } from 'next/router'
import styles from "../../styles/Detail.module.css";
import Link from 'next/link'
import Head from "next/head";
import Image from "next/image";
import placeholderThumbnail from "../../public/images/placeholder-restaurant.png";
import { getPage } from "../../lib/notion";



export default function Resto( { data }: { data: any } ) {  
  console.log(data);
  const router = useRouter();
  const { path } = router.query;
  const pathSplit = String(path).split("-").slice(0,-1);    
  const getDirectionUrl = 'https://maps.google.com/?q=' + pathSplit.join("+");
  
  const clickShare = async() => {
    const shareData = {
      title: 'HalalKompass Link',
      text: `HalalKompass -  ${data.properties["Name"].title[0].plain_text}`,
      url: window.location.href
    }
    
    try {
      await navigator.share(shareData)
    } catch(err) {
      console.log(err);
    }
  }
  
  
  return (
    <div className={styles.container}>
      <Head>
        <title>HalalKompass - {data.properties["Name"].title[0].plain_text}</title>
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
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.header}>
        <Link href="/">
          <div className={styles.headerContainer}>
          <Image
            src="/images/logo-halalcompass.svg"
            height={32}
            width={154}
            alt="halal compass"
          />
          </div>
        </Link>        
      </div>
      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.titleCard}>
            <div className={styles.titleCardThumbnail}>
              {data.properties && data.properties.Thumbnail.files[0].file ? (
                <Image
                  width={60}
                  height={60}
                  alt="thumbnail"
                  src={data.properties.Thumbnail.files[0].file.url}
                />
              ) : (
                <Image
                  width={60}
                  height={60}
                  alt="thumbnail placeholder"
                  src={placeholderThumbnail}
                />
              )}
            </div>
            <div className={styles.titleCardContent}>              
              <div className={styles.titleCardName}>{data.properties["Name"].title[0].plain_text}</div>
              <div className={styles.titleStatus}>
                <i className={styles.iconStatus} />
                <span>Halal Certified</span>
              </div>
            </div>
            <div className={styles.icon} onClick={() => clickShare()}>
              <div className={styles.iconShare}></div>
            </div>              
          </div>
          <div className={styles.address}>
            <div className={styles.addressLabel}>Address</div>
            <div className={styles.addressDetail}>Jl. Suryo No. 40, Rawa Barat, Kebayoran Baru,
              Jakarta Selatan, DKI Jakarta 12180</div>
          </div>
          <div className={styles.map}>
            <img src="https://api.mapbox.com/styles/v1/mapbox/light-v10/static/pin-l-circle+00B08D(106.7896713,-6.24501)/106.7896713,-6.24501,14/656x328?access_token=pk.eyJ1IjoiYmFib25vIiwiYSI6ImNrdW1zeWEwdTN0eG8yd284dmhwOWM0eGIifQ.bzL5KhWkOBuYEX0GZepfEw" alt="Static map image of " />
          </div>
          <a href={getDirectionUrl} target="_blank" rel="noreferrer" className={styles.button}>Get Direction</a>
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps(ctx: any) {
  const path = ctx.query.path;
  const splitter = path.split("-");
  const pageId = splitter[splitter.length -1];
  // Fetch data from external API
  const data = await getPage(pageId);

  // Pass data to the page via props
  return { props: { data } }
}
