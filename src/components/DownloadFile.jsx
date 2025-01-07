import { useEffect } from "react";
import { useParams } from "react-router-dom";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

function DownloadPage({ downloadType }) {
  const params = useParams();
  const AxiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const response = await AxiosPrivate.get(
          `/${downloadType}/file/${params.id}`,
          {
            responseType: "blob",
          }
        );
        if (response.status === 200) {
          const url = URL.createObjectURL(response.data);
          const link = document.createElement("a");
          link.href = url;
          const filename = downloadType === "contract" ? "contract" : "invoice";
          link.download = `${filename}_${params.id}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          window.close(); // Close the window after the download starts
        } else {
          console.error("Error fetching PDF:", response.data.message);
          window.close(); // Close the window after the download starts
        }
      } catch (error) {
        console.error("Error fetching PDF:", error.message);
        window.close(); // Close the window after the download starts
      }
    };

    fetchPdf();
  }, [params.id, downloadType, AxiosPrivate]);

  return null; // This component does not render anything
}

export default DownloadPage;
