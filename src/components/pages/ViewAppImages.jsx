// ImageGallery.jsx

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Spinner,
  Form,
  Modal,
  Button,
} from "react-bootstrap";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import "./ImageGallery.css";
import LazyLoadCard from "../LazyLoadCard";

const ImageGallery = () => {
  const axiosPrivate = useAxiosPrivate();

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);

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
        if (isMounted) {
          setImages(response.data);
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

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [axiosPrivate]);

  // Handle card click to open modal
  const handleCardClick = (image, imageUrl) => {
    setSelectedImage(image);
    setSelectedImageUrl(imageUrl);
    setShowModal(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    if (selectedImageUrl) {
      URL.revokeObjectURL(selectedImageUrl);
      setSelectedImageUrl(null);
    }
    setShowModal(false);
  };

  // Handle image download
  const handleDownload = () => {
    if (selectedImageUrl && selectedImage) {
      const link = document.createElement("a");
      link.href = selectedImageUrl;
      link.download = selectedImage.image_sn || `image_${selectedImage.id}`;
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
    "uploader_user.company_email_address",
    "uploader_user.username",
    "uploader_user.company_name",
    "uploader_user.first_name",
    "uploader_user.last_name",
    "image_date_taken",
    "image_sn",
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
            <LazyLoadCard image={image} handleCardClick={handleCardClick} />
          </Col>
        ))}
      </Row>

      {/* Modal to display full image */}
      {selectedImage && (
        <Modal show={showModal} onHide={handleModalClose} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>{selectedImage.image_sn}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedImageUrl ? (
              <img
                src={selectedImageUrl}
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
            <Button variant="secondary" onClick={handleModalClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleDownload}>
              Download
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
};

export default ImageGallery;
