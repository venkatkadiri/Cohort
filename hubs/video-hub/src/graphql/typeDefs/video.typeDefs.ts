export const videoTypeDefs = `#graphql
  enum VideoProcessingStatus {
    UPLOADING
    QUEUED
    PROCESSING
    READY
    FAILED
  }

  type LectureVideo {
    id: ID!
    teacherId: String!
    teacherName: String!
    title: String!
    description: String
    trackId: String
    trackTitle: String
    originalFileName: String!
    durationSeconds: Int!
    fileSizeBytes: Float!
    status: VideoProcessingStatus!
    progressPercentage: Int!
    masterPlaylistUrl: String!
    availableResolutions: [String!]!
    thumbnailUrl: String
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    videos: [LectureVideo!]!
    video(id: ID!): LectureVideo
    teacherVideos(teacherId: String!): [LectureVideo!]!
    videoHealth: String!
  }

  type Mutation {
    deleteVideo(id: ID!, teacherId: String!): Boolean!
  }
`
