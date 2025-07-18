/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import html2canvas from 'html2canvas';
import { canvasToBlob } from './utils';
import { CaptureResult } from '../types';

function scrollAndLoadFully(): Promise<void> {
  return new Promise((resolve) => {
    const totalHeight = document.body.scrollHeight;
    const scrollStep = window.innerHeight / 2; // Smaller step = more time for rendering
    let currentY = 0;

    function scrollDown() {
      if (currentY >= totalHeight) {
        window.scrollTo(0, 0); // Optional: scroll back up
        setTimeout(resolve, 500); // Give time for last components
        return;
      }
      window.scrollTo(0, currentY);
      currentY += scrollStep;
      setTimeout(scrollDown, 200); // Wait for components to render
    }

    scrollDown();
  });
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const takeScreenshot = async (): Promise<CaptureResult | null> => {
  try {
    const element = document.querySelector('main');

    if (!element) return null;

    await scrollAndLoadFully();
    await wait(5000);

    const canvas = await html2canvas(element as HTMLElement);
    const image = canvas.toDataURL('image/png');
    const blob = await canvasToBlob(canvas);

    return await new Promise((resolve) => {
      resolve({ image, blob });
    });
  } catch (err) {
    return null;
  }
};
