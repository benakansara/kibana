/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo } from 'react';
import type { HoverShapeProps, ShapeProps } from './types';

export const DiamondHoverShape = memo<HoverShapeProps>(({ stroke }) => (
  <path
    opacity="0.5"
    d="M41.6635 4.83648L43.1166 3.3834L43.4702 3.73695L44.1967 3.01041C44.4318 2.77533 44.6784 2.55927 44.9346 2.36215L44.6298 1.96583C45.1937 1.53204 45.8022 1.18367 46.4378 0.920728L46.6289 1.38274C47.2386 1.1305 47.875 0.962054 48.5206 0.877532L48.4557 0.381763C49.1487 0.291027 49.8513 0.291026 50.5443 0.381762L50.4794 0.877531C51.125 0.962052 51.7614 1.1305 52.3711 1.38274L52.5622 0.920724C53.1978 1.18367 53.8063 1.53204 54.3702 1.96583L54.0653 2.36214C54.3216 2.55926 54.5682 2.77533 54.8033 3.01041L55.5299 3.73696L55.8834 3.38341L57.3365 4.83649L56.9829 5.19004L58.436 6.64312L58.7896 6.28957L60.2426 7.74265L59.8891 8.0962L61.3422 9.54928L61.6957 9.19573L63.1488 10.6488L62.7953 11.0024L64.2483 12.4554L64.6019 12.1019L66.055 13.555L65.7014 13.9085L67.1545 15.3616L67.508 15.0081L68.9611 16.4611L68.6076 16.8147L70.0607 18.2678L70.4142 17.9142L71.8673 19.3673L71.5137 19.7208L72.9668 21.1739L73.3204 20.8204L74.7735 22.2735L74.4199 22.627L75.873 24.0801L76.2265 23.7265L77.6796 25.1796L77.3261 25.5332L78.7791 26.9863L79.1327 26.6327L80.5858 28.0858L80.2322 28.4393L81.6853 29.8924L82.0389 29.5389L83.4919 30.9919L83.1384 31.3455L84.5915 32.7986L84.945 32.445L86.3981 33.8981L86.0446 34.2517L87.4976 35.7047L87.8512 35.3512L89.3043 36.8043L88.9507 37.1578L90.4038 38.6109L90.7574 38.2574L92.2104 39.7104L91.8569 40.064L93.31 41.5171L93.6635 41.1635L95.1166 42.6166L94.763 42.9702L95.4896 43.6967C95.7247 43.9318 95.9407 44.1784 96.1378 44.4346L96.5342 44.1298C96.968 44.6937 97.3163 45.3022 97.5793 45.9378L97.1173 46.1289C97.3695 46.7386 97.5379 47.375 97.6225 48.0206L98.1182 47.9557C98.209 48.6487 98.209 49.3513 98.1182 50.0443L97.6225 49.9794C97.5379 50.625 97.3695 51.2614 97.1173 51.8711L97.5793 52.0622C97.3163 52.6978 96.968 53.3063 96.5342 53.8702L96.1379 53.5653C95.9407 53.8216 95.7247 54.0682 95.4896 54.3033L94.7631 55.0298L95.1166 55.3834L93.6635 56.8365L93.31 56.4829L91.8569 57.936L92.2104 58.2896L90.7574 59.7426L90.4038 59.3891L88.9507 60.8422L89.3043 61.1957L87.8512 62.6488L87.4977 62.2952L86.0446 63.7483L86.3981 64.1019L84.945 65.555L84.5915 65.2014L83.1384 66.6545L83.492 67.008L82.0389 68.4611L81.6853 68.1076L80.2322 69.5607L80.5858 69.9142L79.1327 71.3673L78.7792 71.0137L77.3261 72.4668L77.6796 72.8204L76.2265 74.2735L75.873 73.9199L74.4199 75.373L74.7735 75.7265L73.3204 77.1796L72.9668 76.8261L71.5137 78.2791L71.8673 78.6327L70.4142 80.0858L70.0607 79.7322L68.6076 81.1853L68.9611 81.5389L67.5081 82.9919L67.1545 82.6384L65.7014 84.0915L66.055 84.445L64.6019 85.8981L64.2483 85.5446L62.7953 86.9976L63.1488 87.3512L61.6957 88.8043L61.3422 88.4507L59.8891 89.9038L60.2426 90.2574L58.7896 91.7104L58.436 91.3569L56.9829 92.81L57.3365 93.1635L55.8834 94.6166L55.5298 94.263L54.8033 94.9896C54.5682 95.2247 54.3216 95.4407 54.0654 95.6378L54.3702 96.0342C53.8063 96.468 53.1978 96.8163 52.5622 97.0793L52.3711 96.6173C51.7614 96.8695 51.125 97.0379 50.4794 97.1225L50.5443 97.6182C49.8513 97.709 49.1487 97.709 48.4557 97.6182L48.5206 97.1225C47.875 97.0379 47.2386 96.8695 46.6289 96.6173L46.4378 97.0793C45.8022 96.8163 45.1937 96.468 44.6298 96.0342L44.9347 95.6379C44.6784 95.4407 44.4318 95.2247 44.1967 94.9896L43.4702 94.2631L43.1166 94.6166L41.6635 93.1635L42.0171 92.81L40.564 91.3569L40.2104 91.7104L38.7574 90.2574L39.1109 89.9038L37.6578 88.4507L37.3043 88.8043L35.8512 87.3512L36.2048 86.9977L34.7517 85.5446L34.3981 85.8981L32.945 84.445L33.2986 84.0915L31.8455 82.6384L31.492 82.992L30.0389 81.5389L30.3924 81.1853L28.9393 79.7322L28.5858 80.0858L27.1327 78.6327L27.4863 78.2792L26.0332 76.8261L25.6796 77.1796L24.2265 75.7265L24.5801 75.373L23.127 73.9199L22.7735 74.2735L21.3204 72.8204L21.6739 72.4668L20.2209 71.0137L19.8673 71.3673L18.4142 69.9142L18.7678 69.5607L17.3147 68.1076L16.9611 68.4611L15.5081 67.0081L15.8616 66.6545L14.4085 65.2014L14.055 65.555L12.6019 64.1019L12.9554 63.7483L11.5024 62.2953L11.1488 62.6488L9.69573 61.1957L10.0493 60.8422L8.5962 59.3891L8.24264 59.7426L6.78956 58.2896L7.14312 57.936L5.69003 56.4829L5.33648 56.8365L3.8834 55.3834L4.23695 55.0298L3.51041 54.3033C3.27533 54.0682 3.05927 53.8216 2.86215 53.5654L2.46583 53.8702C2.03204 53.3063 1.68367 52.6978 1.42073 52.0622L1.88274 51.8711C1.6305 51.2614 1.46205 50.625 1.37753 49.9794L0.881763 50.0443C0.791027 49.3513 0.791026 48.6487 0.881762 47.9557L1.37753 48.0206C1.46205 47.375 1.6305 46.7386 1.88274 46.1289L1.42072 45.9378C1.68367 45.3022 2.03204 44.6937 2.46583 44.1298L2.86214 44.4347C3.05926 44.1784 3.27533 43.9318 3.51041 43.6967L4.23694 42.9702L3.88338 42.6166L5.33646 41.1635L5.69002 41.5171L7.1431 40.064L6.78955 39.7105L8.24263 38.2574L8.59618 38.6109L10.0493 37.1578L9.69571 36.8043L11.1488 35.3512L11.5023 35.7048L12.9554 34.2517L12.6019 33.8981L14.055 32.445L14.4085 32.7986L15.8616 31.3455L15.508 30.992L16.9611 29.5389L17.3147 29.8924L18.7678 28.4393L18.4142 28.0858L19.8673 26.6327L20.2208 26.9863L21.6739 25.5332L21.3204 25.1796L22.7735 23.7265L23.127 24.0801L24.5801 22.627L24.2265 22.2735L25.6796 20.8204L26.0332 21.1739L27.4863 19.7209L27.1327 19.3673L28.5858 17.9142L28.9393 18.2678L30.3924 16.8147L30.0389 16.4611L31.4919 15.0081L31.8455 15.3616L33.2986 13.9085L32.945 13.555L34.3981 12.1019L34.7517 12.4554L36.2047 11.0024L35.8512 10.6488L37.3043 9.19573L37.6578 9.54928L39.1109 8.0962L38.7574 7.74264L40.2104 6.28956L40.564 6.64312L42.0171 5.19003L41.6635 4.83648Z"
    stroke={stroke}
    strokeDasharray="2 2"
  />
));
DiamondHoverShape.displayName = 'DiamondHoverShape';

export const DiamondShape = memo<ShapeProps>(({ stroke, fill }) => (
  <path
    d="M34.1967 3.01041C37.1256 0.0814755 41.8744 0.0814755 44.8033 3.01041L75.4896 33.6967C78.4185 36.6256 78.4185 41.3744 75.4896 44.3033L44.8033 74.9896C41.8744 77.9185 37.1256 77.9185 34.1967 74.9896L3.51041 44.3033C0.581475 41.3744 0.581475 36.6256 3.51041 33.6967L34.1967 3.01041Z"
    fill={fill}
    stroke={stroke}
  />
));
DiamondShape.displayName = 'DiamondShape';
