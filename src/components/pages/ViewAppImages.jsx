import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Form,
  Modal,
  Button,
} from "react-bootstrap";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import "./ImageGallery.css";

const ImageGallery = () => {
  const axiosPrivate = useAxiosPrivate();

  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    let isMounted = true;

    // Fetch image metadata from API
    const fetchImages = async () => {
      try {
        const response = await axiosPrivate.get("/appimages/");
        if (!response.data) {
          throw new Error("No data returned from the server");
        }

        console.log("Images:", response.data);
        setImages(response.data);

        // Fetch image data for each image
        const imagePromises = response.data.map(async (image) => {
          try {
            const imageResponse = await axiosPrivate.get(
              `/appimages/file/${image.id}`,
              { responseType: "blob" }
            );
            const imageUrl = URL.createObjectURL(imageResponse.data);
            return { id: image.id, url: imageUrl };
          } catch (error) {
            console.error(`Error fetching image ${image.id}:`, error);
            return null;
          }
        });

        const imageData = await Promise.all(imagePromises);
        if (isMounted) {
          const urls = {};
          imageData.forEach((data) => {
            if (data) {
              urls[data.id] = data.url;
            }
          });
          setImageUrls(urls);
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchImages();

    // Cleanup function to revoke object URLs and prevent memory leaks
    return () => {
      isMounted = false;
      Object.values(imageUrls).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [axiosPrivate]);

  // Handle card click to open modal
  const handleCardClick = (image) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  // Handle image download
  const handleDownload = (image) => {
    if (imageUrls[image.id]) {
      const link = document.createElement("a");
      link.href = imageUrls[image.id];
      link.download = image.image_sn || `image_${image.id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  // Helper function to get nested property values
  const getNestedValue = (obj, path) =>
    path.split(".").reduce((acc, part) => acc && acc[part], obj);

  // Fields to search on
  const fieldsToSearch = [
    "uploader_user.email",
    "uploader_user.username",
    "uploader_user.company",
    "uploader_user.name",
    "image_date_taken",
  ];

  // Filter images based on the search term
  const filteredImages = images.filter((image) => {
    return fieldsToSearch.some((path) => {
      let field = getNestedValue(image, path);
      if (field) {
        if (path === "image_date_taken") {
          field = new Date(field).toLocaleDateString();
        }
        return field
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      }
      return false;
    });
  });

  return (
    <Container className="mt-5">
      <h1>Image Gallery</h1>

      {/* Search Input Field */}
      <Form className="mb-4">
        <Form.Control
          type="text"
          placeholder="Search images..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form>

      <Row xs={1} sm={2} md={3} lg={4}>
        {filteredImages.map((image) => (
          <Col key={image.id} className="mb-4">
            <Card
              onClick={() => handleCardClick(image)}
              style={{ cursor: "pointer" }}
            >
              <div className="image-container">
                {imageUrls[image.id] ? (
                  <Card.Img
                    variant="top"
                    src={imageUrls[image.id]}
                    alt={`Image ${image.id}`}
                  />
                ) : (
                  <div className="placeholder-image">
                    <Spinner animation="border" variant="primary" />
                  </div>
                )}
              </div>
              <Card.Body>
                <Card.Title>{image.image_sn}</Card.Title>
                <Card.Text>
                  <strong>Date Taken:</strong>{" "}
                  {new Date(image.image_date_taken).toLocaleDateString()}
                </Card.Text>
                <Card.Text>
                  <strong>Uploader:</strong> {image.uploader_user.name}
                </Card.Text>
                <Card.Text>
                  <strong>Email:</strong> {image.uploader_user.email}
                </Card.Text>
                <Card.Text>
                  <strong>Company:</strong> {image.uploader_user.company}
                </Card.Text>
                <Card.Text>
                  <strong>Username:</strong> {image.uploader_user.username}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal to display full image */}
      {selectedImage && (
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>{selectedImage.image_sn}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {imageUrls[selectedImage.id] ? (
              <img
                src={imageUrls[selectedImage.id]}
                alt={`Image ${selectedImage.id}`}
                style={{ width: "100%" }}
              />
            ) : (
              <div className="placeholder-image">
                <Spinner animation="border" variant="primary" />
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => handleDownload(selectedImage)}
            >
              Download
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
};

export default ImageGallery;
