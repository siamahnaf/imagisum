//UI
import { Container } from "@/components/ui";

//Components
import DownloadBox from "@/components/home/DownloadBox";
import ImageGallery from "@/components/home/ImageGallery";

//Types
import { LImage } from "@/types/image.types";

const Page = async () => {
  const randomPage = Math.floor(Math.random() * 20) + 1;
  //Fetching Data
  const response = await fetch(`https://picsum.photos/v2/list?page=${randomPage}&limit=30`);

  const data: LImage[] = await response.json();

  return (
    <section className="py-10">
      <Container>
        <DownloadBox />
        <ImageGallery data={data} />
      </Container>
    </section>
  );
};

export default Page; 