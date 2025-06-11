/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useRef, useState, useEffect } from 'react';

interface Annotation {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageAnnotatorProps {
  imageSrc: string;
  width?: number;
}

export function ImageAnnotator({ imageSrc, width = 500 }: ImageAnnotatorProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [newRect, setNewRect] = useState<Annotation | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [imgHeight, setImgHeight] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const startPoint = useRef<{ x: number; y: number } | null>(null);

  // Set height based on image aspect ratio
  useEffect(() => {
    const img = imageRef.current;
    if (img && img.complete) {
      const updateSize = () => {
        const aspectRatio = img.naturalHeight / img.naturalWidth;
        setImgHeight(width * aspectRatio);
      };
      updateSize();
    } else if (img) {
      img.onload = () => {
        const aspectRatio = img.naturalHeight / img.naturalWidth;
        setImgHeight(width * aspectRatio);
      };
    }
  }, [imageSrc, width]);

  // Global mouse up to ensure it works even if mouse is released outside
  useEffect(() => {
    const handleMouseUp = () => {
      if (newRect) {
        setAnnotations((prev) => [...prev, newRect]);
        setNewRect(null);
      }
      setIsDrawing(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawing || !startPoint.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const updatedRect: Annotation = {
        x: Math.min(startPoint.current.x, x),
        y: Math.min(startPoint.current.y, y),
        width: Math.abs(x - startPoint.current.x),
        height: Math.abs(y - startPoint.current.y),
      };

      setNewRect(updatedRect);
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDrawing, newRect]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    startPoint.current = { x, y };
    setIsDrawing(true);
  };

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width, height: imgHeight, userSelect: 'none' }}
      onMouseDown={handleMouseDown}
    >
      <img
        ref={imageRef}
        src={imageSrc}
        alt="To annotate"
        style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }}
        draggable={false}
      />
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        {[...annotations, newRect].filter(Boolean).map((rect, idx) => (
          <rect
            key={idx}
            x={rect!.x}
            y={rect!.y}
            width={rect!.width}
            height={rect!.height}
            stroke="red"
            fill="transparent"
            strokeWidth={2}
          />
        ))}
      </svg>
    </div>
  );
}
