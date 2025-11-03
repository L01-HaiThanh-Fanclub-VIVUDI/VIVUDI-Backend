export const SEQUELIZE = 'SEQUELIZE';
export const AUTH_REPOSITORY = 'AUTH_REPOSITORY';

export enum PostVisibility {
    PUBLIC = 'public',
    PRIVATE = 'private',
    FRIENDS = 'friends',
}

export enum MediaType {
    IMAGE = 'image',
    VIDEO = 'video',
}

export enum OwnerMediaType {
    POST = 'post',
    LOCATION = 'location',
}


export enum LocationType {
    COFFEE = 'coffee',
    STREET_FOOD = 'street_food',
    RESTAURANT = 'restaurant',
    OTHER = 'other',
}

export const GOOGLE_DRIVE_ROOT_FOLDER_ID = '1yOwWaFT57zf7qhD8nWfRJbQULP8UPUNw';