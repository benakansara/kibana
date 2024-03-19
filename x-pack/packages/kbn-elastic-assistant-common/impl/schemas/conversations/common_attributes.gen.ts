/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { z } from 'zod';

/*
 * NOTICE: Do not edit this file manually.
 * This file is automatically generated by the OpenAPI Generator, @kbn/openapi-generator.
 *
 * info:
 *   title: Common Conversation Attributes
 *   version: not applicable
 */

/**
 * A string that is not empty and does not contain only whitespace
 */
export type NonEmptyString = z.infer<typeof NonEmptyString>;
export const NonEmptyString = z
  .string()
  .min(1)
  .regex(/^(?! *$).+$/);

/**
 * A universally unique identifier
 */
export type UUID = z.infer<typeof UUID>;
export const UUID = z.string().uuid();

/**
 * Could be any string, not necessarily a UUID
 */
export type User = z.infer<typeof User>;
export const User = z.object({
  /**
   * User id.
   */
  id: z.string().optional(),
  /**
   * User name.
   */
  name: z.string().optional(),
});

/**
 * trace Data
 */
export type TraceData = z.infer<typeof TraceData>;
export const TraceData = z.object({
  /**
   * Could be any string, not necessarily a UUID
   */
  transactionId: z.string().optional(),
  /**
   * Could be any string, not necessarily a UUID
   */
  traceId: z.string().optional(),
});

/**
 * Replacements object used to anonymize/deanomymize messsages
 */
export type Replacement = z.infer<typeof Replacement>;
export const Replacement = z.object({
  /**
   * Actual value was anonymized.
   */
  value: z.string(),
  uuid: UUID,
});

export type Reader = z.infer<typeof Reader>;
export const Reader = z.object({}).catchall(z.unknown());

/**
 * Provider
 */
export type Provider = z.infer<typeof Provider>;
export const Provider = z.enum(['OpenAI', 'Azure OpenAI']);
export type ProviderEnum = typeof Provider.enum;
export const ProviderEnum = Provider.enum;

/**
 * Message role.
 */
export type MessageRole = z.infer<typeof MessageRole>;
export const MessageRole = z.enum(['system', 'user', 'assistant']);
export type MessageRoleEnum = typeof MessageRole.enum;
export const MessageRoleEnum = MessageRole.enum;

/**
 * The conversation category.
 */
export type ConversationCategory = z.infer<typeof ConversationCategory>;
export const ConversationCategory = z.enum(['assistant', 'insights']);
export type ConversationCategoryEnum = typeof ConversationCategory.enum;
export const ConversationCategoryEnum = ConversationCategory.enum;

/**
 * The conversation confidence.
 */
export type ConversationConfidence = z.infer<typeof ConversationConfidence>;
export const ConversationConfidence = z.enum(['low', 'medium', 'high']);
export type ConversationConfidenceEnum = typeof ConversationConfidence.enum;
export const ConversationConfidenceEnum = ConversationConfidence.enum;

/**
 * AI assistant conversation message.
 */
export type Message = z.infer<typeof Message>;
export const Message = z.object({
  /**
   * Message content.
   */
  content: z.string(),
  /**
   * Message content.
   */
  reader: Reader.optional(),
  /**
   * Message role.
   */
  role: MessageRole,
  /**
   * The timestamp message was sent or received.
   */
  timestamp: NonEmptyString,
  /**
   * Is error message.
   */
  isError: z.boolean().optional(),
  /**
   * trace Data
   */
  traceData: TraceData.optional(),
});

export type ApiConfig = z.infer<typeof ApiConfig>;
export const ApiConfig = z.object({
  /**
   * connector Id
   */
  connectorId: z.string(),
  /**
   * connector Type Title
   */
  connectorTypeTitle: z.string(),
  /**
   * defaultSystemPromptId
   */
  defaultSystemPromptId: z.string().optional(),
  /**
   * Provider
   */
  provider: Provider.optional(),
  /**
   * model
   */
  model: z.string().optional(),
});

export type ConversationSummary = z.infer<typeof ConversationSummary>;
export const ConversationSummary = z.object({
  /**
   * Summary text of the conversation over time.
   */
  content: z.string().optional(),
  /**
   * The timestamp summary was updated.
   */
  timestamp: NonEmptyString.optional(),
  /**
   * Define if summary is marked as publicly available.
   */
  public: z.boolean().optional(),
  /**
   * How confident you are about this being a correct and useful learning.
   */
  confidence: ConversationConfidence.optional(),
});

export type ErrorSchema = z.infer<typeof ErrorSchema>;
export const ErrorSchema = z
  .object({
    id: UUID.optional(),
    error: z.object({
      status_code: z.number().int().min(400),
      message: z.string(),
    }),
  })
  .strict();

export type ConversationResponse = z.infer<typeof ConversationResponse>;
export const ConversationResponse = z.object({
  id: z.union([UUID, NonEmptyString]),
  /**
   * The conversation title.
   */
  title: z.string(),
  /**
   * The conversation category.
   */
  category: ConversationCategory,
  summary: ConversationSummary.optional(),
  timestamp: NonEmptyString.optional(),
  /**
   * The last time conversation was updated.
   */
  updatedAt: z.string().optional(),
  /**
   * The last time conversation was updated.
   */
  createdAt: z.string(),
  replacements: z.array(Replacement).optional(),
  users: z.array(User),
  /**
   * The conversation messages.
   */
  messages: z.array(Message).optional(),
  /**
   * LLM API configuration.
   */
  apiConfig: ApiConfig.optional(),
  /**
   * Is default conversation.
   */
  isDefault: z.boolean().optional(),
  /**
   * excludeFromLastConversationStorage.
   */
  excludeFromLastConversationStorage: z.boolean().optional(),
  /**
   * Kibana space
   */
  namespace: z.string(),
});

export type ConversationUpdateProps = z.infer<typeof ConversationUpdateProps>;
export const ConversationUpdateProps = z.object({
  id: z.union([UUID, NonEmptyString]),
  /**
   * The conversation title.
   */
  title: z.string().optional(),
  /**
   * The conversation category.
   */
  category: ConversationCategory.optional(),
  /**
   * The conversation messages.
   */
  messages: z.array(Message).optional(),
  /**
   * LLM API configuration.
   */
  apiConfig: ApiConfig.optional(),
  summary: ConversationSummary.optional(),
  /**
   * excludeFromLastConversationStorage.
   */
  excludeFromLastConversationStorage: z.boolean().optional(),
  replacements: z.array(Replacement).optional(),
});

export type ConversationCreateProps = z.infer<typeof ConversationCreateProps>;
export const ConversationCreateProps = z.object({
  /**
   * The conversation title.
   */
  title: z.string(),
  /**
   * The conversation category.
   */
  category: ConversationCategory.optional(),
  /**
   * The conversation messages.
   */
  messages: z.array(Message).optional(),
  /**
   * LLM API configuration.
   */
  apiConfig: ApiConfig.optional(),
  /**
   * Is default conversation.
   */
  isDefault: z.boolean().optional(),
  /**
   * excludeFromLastConversationStorage.
   */
  excludeFromLastConversationStorage: z.boolean().optional(),
  replacements: z.array(Replacement).optional(),
});

export type ConversationMessageCreateProps = z.infer<typeof ConversationMessageCreateProps>;
export const ConversationMessageCreateProps = z.object({
  /**
   * The conversation messages.
   */
  messages: z.array(Message),
});
