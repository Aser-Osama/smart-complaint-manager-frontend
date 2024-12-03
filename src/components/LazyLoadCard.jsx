// LazyLoadCard.jsx

import React, { useState, useEffect, useRef } from "react";
import { Card, Spinner } from "react-bootstrap";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const LazyLoadCard = ({ image, handleCardClick }) => {
  const axiosPrivate = useAxiosPrivate();
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    if (imgRef.current) {
      observerRef.current = new IntersectionObserver(
        async (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting && !imageUrl && isMounted) {
            setIsLoading(true);
            try {
              const imageResponse = await axiosPrivate.get(
                `/appimages/file/${image.id}`,
                { responseType: "blob" }
              );
              const url = URL.createObjectURL(imageResponse.data);
              if (isMounted) {
                setImageUrl(url);
              }
            } catch (error) {
              console.error(`Error fetching image ${image.id}:`, error);
            } finally {
              if (isMounted) {
                setIsLoading(false);
              }
            }
          }
        },
        { threshold: 0.1 }
      );

      observerRef.current.observe(imgRef.current);
    }

    return () => {
      isMounted = false;
      if (observerRef.current && imgRef.current) {
        observerRef.current.unobserve(imgRef.current);
      }
    };
  }, [axiosPrivate, image.id, imageUrl]);

  return (
    <Card
      onClick={() => handleCardClick(image, imageUrl)}
      style={{ cursor: "pointer" }}
    >
      <div
        className="image-container"
        ref={imgRef}
        style={{ minHeight: "200px" }}
      >
        {isLoading && (
          <div className="placeholder-image">
            <Spinner animation="border" variant="primary" />
          </div>
        )}
        {imageUrl ? (
          <Card.Img variant="top" src={imageUrl} alt={`Image ${image.id}`} />
        ) : !isLoading ? (
          <div
            className="placeholder-image"
            style={{ height: "200px", backgroundColor: "#eee" }}
          ></div>
        ) : null}
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
  );
};

export default LazyLoadCard;
