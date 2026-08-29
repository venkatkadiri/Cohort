from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable, Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class Empty(_message.Message):
    __slots__ = ()
    def __init__(self) -> None: ...

class StatusResponse(_message.Message):
    __slots__ = ("success", "message")
    SUCCESS_FIELD_NUMBER: _ClassVar[int]
    MESSAGE_FIELD_NUMBER: _ClassVar[int]
    success: bool
    message: str
    def __init__(self, success: bool = ..., message: _Optional[str] = ...) -> None: ...

class UserCount(_message.Message):
    __slots__ = ("event_types", "bookings")
    EVENT_TYPES_FIELD_NUMBER: _ClassVar[int]
    BOOKINGS_FIELD_NUMBER: _ClassVar[int]
    event_types: int
    bookings: int
    def __init__(self, event_types: _Optional[int] = ..., bookings: _Optional[int] = ...) -> None: ...

class UserModel(_message.Message):
    __slots__ = ("id", "email", "name", "slug", "timezone", "created_at", "updated_at", "count")
    ID_FIELD_NUMBER: _ClassVar[int]
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    SLUG_FIELD_NUMBER: _ClassVar[int]
    TIMEZONE_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    UPDATED_AT_FIELD_NUMBER: _ClassVar[int]
    COUNT_FIELD_NUMBER: _ClassVar[int]
    id: int
    email: str
    name: str
    slug: str
    timezone: str
    created_at: str
    updated_at: str
    count: UserCount
    def __init__(self, id: _Optional[int] = ..., email: _Optional[str] = ..., name: _Optional[str] = ..., slug: _Optional[str] = ..., timezone: _Optional[str] = ..., created_at: _Optional[str] = ..., updated_at: _Optional[str] = ..., count: _Optional[_Union[UserCount, _Mapping]] = ...) -> None: ...

class ListUsersResponse(_message.Message):
    __slots__ = ("users",)
    USERS_FIELD_NUMBER: _ClassVar[int]
    users: _containers.RepeatedCompositeFieldContainer[UserModel]
    def __init__(self, users: _Optional[_Iterable[_Union[UserModel, _Mapping]]] = ...) -> None: ...

class GetUserRequest(_message.Message):
    __slots__ = ("id", "slug")
    ID_FIELD_NUMBER: _ClassVar[int]
    SLUG_FIELD_NUMBER: _ClassVar[int]
    id: int
    slug: str
    def __init__(self, id: _Optional[int] = ..., slug: _Optional[str] = ...) -> None: ...

class CreateUserRequest(_message.Message):
    __slots__ = ("name", "email", "slug", "timezone")
    NAME_FIELD_NUMBER: _ClassVar[int]
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    SLUG_FIELD_NUMBER: _ClassVar[int]
    TIMEZONE_FIELD_NUMBER: _ClassVar[int]
    name: str
    email: str
    slug: str
    timezone: str
    def __init__(self, name: _Optional[str] = ..., email: _Optional[str] = ..., slug: _Optional[str] = ..., timezone: _Optional[str] = ...) -> None: ...

class UpdateUserRequest(_message.Message):
    __slots__ = ("id", "name", "email", "slug", "timezone")
    ID_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    SLUG_FIELD_NUMBER: _ClassVar[int]
    TIMEZONE_FIELD_NUMBER: _ClassVar[int]
    id: int
    name: str
    email: str
    slug: str
    timezone: str
    def __init__(self, id: _Optional[int] = ..., name: _Optional[str] = ..., email: _Optional[str] = ..., slug: _Optional[str] = ..., timezone: _Optional[str] = ...) -> None: ...

class DeleteUserRequest(_message.Message):
    __slots__ = ("id",)
    ID_FIELD_NUMBER: _ClassVar[int]
    id: int
    def __init__(self, id: _Optional[int] = ...) -> None: ...

class EventTypeModel(_message.Message):
    __slots__ = ("id", "host_id", "title", "description", "slug", "duration_minutes", "is_active", "location_type", "location_value", "buffer_before_minutes", "buffer_after_minutes", "created_at", "updated_at")
    ID_FIELD_NUMBER: _ClassVar[int]
    HOST_ID_FIELD_NUMBER: _ClassVar[int]
    TITLE_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    SLUG_FIELD_NUMBER: _ClassVar[int]
    DURATION_MINUTES_FIELD_NUMBER: _ClassVar[int]
    IS_ACTIVE_FIELD_NUMBER: _ClassVar[int]
    LOCATION_TYPE_FIELD_NUMBER: _ClassVar[int]
    LOCATION_VALUE_FIELD_NUMBER: _ClassVar[int]
    BUFFER_BEFORE_MINUTES_FIELD_NUMBER: _ClassVar[int]
    BUFFER_AFTER_MINUTES_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    UPDATED_AT_FIELD_NUMBER: _ClassVar[int]
    id: int
    host_id: int
    title: str
    description: str
    slug: str
    duration_minutes: int
    is_active: bool
    location_type: str
    location_value: str
    buffer_before_minutes: int
    buffer_after_minutes: int
    created_at: str
    updated_at: str
    def __init__(self, id: _Optional[int] = ..., host_id: _Optional[int] = ..., title: _Optional[str] = ..., description: _Optional[str] = ..., slug: _Optional[str] = ..., duration_minutes: _Optional[int] = ..., is_active: bool = ..., location_type: _Optional[str] = ..., location_value: _Optional[str] = ..., buffer_before_minutes: _Optional[int] = ..., buffer_after_minutes: _Optional[int] = ..., created_at: _Optional[str] = ..., updated_at: _Optional[str] = ...) -> None: ...

class ListEventTypesRequest(_message.Message):
    __slots__ = ("host_id",)
    HOST_ID_FIELD_NUMBER: _ClassVar[int]
    host_id: int
    def __init__(self, host_id: _Optional[int] = ...) -> None: ...

class ListEventTypesResponse(_message.Message):
    __slots__ = ("event_types",)
    EVENT_TYPES_FIELD_NUMBER: _ClassVar[int]
    event_types: _containers.RepeatedCompositeFieldContainer[EventTypeModel]
    def __init__(self, event_types: _Optional[_Iterable[_Union[EventTypeModel, _Mapping]]] = ...) -> None: ...

class GetEventTypeRequest(_message.Message):
    __slots__ = ("id", "host_id", "slug")
    ID_FIELD_NUMBER: _ClassVar[int]
    HOST_ID_FIELD_NUMBER: _ClassVar[int]
    SLUG_FIELD_NUMBER: _ClassVar[int]
    id: int
    host_id: int
    slug: str
    def __init__(self, id: _Optional[int] = ..., host_id: _Optional[int] = ..., slug: _Optional[str] = ...) -> None: ...

class PublicEventTypeResponse(_message.Message):
    __slots__ = ("event_type", "host")
    EVENT_TYPE_FIELD_NUMBER: _ClassVar[int]
    HOST_FIELD_NUMBER: _ClassVar[int]
    event_type: EventTypeModel
    host: UserModel
    def __init__(self, event_type: _Optional[_Union[EventTypeModel, _Mapping]] = ..., host: _Optional[_Union[UserModel, _Mapping]] = ...) -> None: ...

class CreateEventTypeRequest(_message.Message):
    __slots__ = ("host_id", "title", "description", "slug", "duration_minutes", "is_active", "location_type", "location_value", "buffer_before_minutes", "buffer_after_minutes")
    HOST_ID_FIELD_NUMBER: _ClassVar[int]
    TITLE_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    SLUG_FIELD_NUMBER: _ClassVar[int]
    DURATION_MINUTES_FIELD_NUMBER: _ClassVar[int]
    IS_ACTIVE_FIELD_NUMBER: _ClassVar[int]
    LOCATION_TYPE_FIELD_NUMBER: _ClassVar[int]
    LOCATION_VALUE_FIELD_NUMBER: _ClassVar[int]
    BUFFER_BEFORE_MINUTES_FIELD_NUMBER: _ClassVar[int]
    BUFFER_AFTER_MINUTES_FIELD_NUMBER: _ClassVar[int]
    host_id: int
    title: str
    description: str
    slug: str
    duration_minutes: int
    is_active: bool
    location_type: str
    location_value: str
    buffer_before_minutes: int
    buffer_after_minutes: int
    def __init__(self, host_id: _Optional[int] = ..., title: _Optional[str] = ..., description: _Optional[str] = ..., slug: _Optional[str] = ..., duration_minutes: _Optional[int] = ..., is_active: bool = ..., location_type: _Optional[str] = ..., location_value: _Optional[str] = ..., buffer_before_minutes: _Optional[int] = ..., buffer_after_minutes: _Optional[int] = ...) -> None: ...

class UpdateEventTypeRequest(_message.Message):
    __slots__ = ("id", "host_id", "title", "description", "slug", "duration_minutes", "is_active", "location_type", "location_value", "buffer_before_minutes", "buffer_after_minutes")
    ID_FIELD_NUMBER: _ClassVar[int]
    HOST_ID_FIELD_NUMBER: _ClassVar[int]
    TITLE_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    SLUG_FIELD_NUMBER: _ClassVar[int]
    DURATION_MINUTES_FIELD_NUMBER: _ClassVar[int]
    IS_ACTIVE_FIELD_NUMBER: _ClassVar[int]
    LOCATION_TYPE_FIELD_NUMBER: _ClassVar[int]
    LOCATION_VALUE_FIELD_NUMBER: _ClassVar[int]
    BUFFER_BEFORE_MINUTES_FIELD_NUMBER: _ClassVar[int]
    BUFFER_AFTER_MINUTES_FIELD_NUMBER: _ClassVar[int]
    id: int
    host_id: int
    title: str
    description: str
    slug: str
    duration_minutes: int
    is_active: bool
    location_type: str
    location_value: str
    buffer_before_minutes: int
    buffer_after_minutes: int
    def __init__(self, id: _Optional[int] = ..., host_id: _Optional[int] = ..., title: _Optional[str] = ..., description: _Optional[str] = ..., slug: _Optional[str] = ..., duration_minutes: _Optional[int] = ..., is_active: bool = ..., location_type: _Optional[str] = ..., location_value: _Optional[str] = ..., buffer_before_minutes: _Optional[int] = ..., buffer_after_minutes: _Optional[int] = ...) -> None: ...

class DeleteEventTypeRequest(_message.Message):
    __slots__ = ("id", "host_id")
    ID_FIELD_NUMBER: _ClassVar[int]
    HOST_ID_FIELD_NUMBER: _ClassVar[int]
    id: int
    host_id: int
    def __init__(self, id: _Optional[int] = ..., host_id: _Optional[int] = ...) -> None: ...

class AvailabilityRuleModel(_message.Message):
    __slots__ = ("id", "user_id", "weekday", "start_time", "end_time", "is_active", "timezone", "created_at", "updated_at")
    ID_FIELD_NUMBER: _ClassVar[int]
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    WEEKDAY_FIELD_NUMBER: _ClassVar[int]
    START_TIME_FIELD_NUMBER: _ClassVar[int]
    END_TIME_FIELD_NUMBER: _ClassVar[int]
    IS_ACTIVE_FIELD_NUMBER: _ClassVar[int]
    TIMEZONE_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    UPDATED_AT_FIELD_NUMBER: _ClassVar[int]
    id: int
    user_id: int
    weekday: int
    start_time: str
    end_time: str
    is_active: bool
    timezone: str
    created_at: str
    updated_at: str
    def __init__(self, id: _Optional[int] = ..., user_id: _Optional[int] = ..., weekday: _Optional[int] = ..., start_time: _Optional[str] = ..., end_time: _Optional[str] = ..., is_active: bool = ..., timezone: _Optional[str] = ..., created_at: _Optional[str] = ..., updated_at: _Optional[str] = ...) -> None: ...

class AvailabilityExceptionModel(_message.Message):
    __slots__ = ("id", "user_id", "date", "type", "start_time", "end_time", "timezone", "reason", "created_at", "updated_at")
    ID_FIELD_NUMBER: _ClassVar[int]
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    DATE_FIELD_NUMBER: _ClassVar[int]
    TYPE_FIELD_NUMBER: _ClassVar[int]
    START_TIME_FIELD_NUMBER: _ClassVar[int]
    END_TIME_FIELD_NUMBER: _ClassVar[int]
    TIMEZONE_FIELD_NUMBER: _ClassVar[int]
    REASON_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    UPDATED_AT_FIELD_NUMBER: _ClassVar[int]
    id: int
    user_id: int
    date: str
    type: str
    start_time: str
    end_time: str
    timezone: str
    reason: str
    created_at: str
    updated_at: str
    def __init__(self, id: _Optional[int] = ..., user_id: _Optional[int] = ..., date: _Optional[str] = ..., type: _Optional[str] = ..., start_time: _Optional[str] = ..., end_time: _Optional[str] = ..., timezone: _Optional[str] = ..., reason: _Optional[str] = ..., created_at: _Optional[str] = ..., updated_at: _Optional[str] = ...) -> None: ...

class ListAvailabilityRequest(_message.Message):
    __slots__ = ("user_id",)
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    user_id: int
    def __init__(self, user_id: _Optional[int] = ...) -> None: ...

class ListRulesResponse(_message.Message):
    __slots__ = ("rules",)
    RULES_FIELD_NUMBER: _ClassVar[int]
    rules: _containers.RepeatedCompositeFieldContainer[AvailabilityRuleModel]
    def __init__(self, rules: _Optional[_Iterable[_Union[AvailabilityRuleModel, _Mapping]]] = ...) -> None: ...

class CreateRuleRequest(_message.Message):
    __slots__ = ("user_id", "weekday", "start_time", "end_time", "is_active", "timezone")
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    WEEKDAY_FIELD_NUMBER: _ClassVar[int]
    START_TIME_FIELD_NUMBER: _ClassVar[int]
    END_TIME_FIELD_NUMBER: _ClassVar[int]
    IS_ACTIVE_FIELD_NUMBER: _ClassVar[int]
    TIMEZONE_FIELD_NUMBER: _ClassVar[int]
    user_id: int
    weekday: int
    start_time: str
    end_time: str
    is_active: bool
    timezone: str
    def __init__(self, user_id: _Optional[int] = ..., weekday: _Optional[int] = ..., start_time: _Optional[str] = ..., end_time: _Optional[str] = ..., is_active: bool = ..., timezone: _Optional[str] = ...) -> None: ...

class UpdateRuleRequest(_message.Message):
    __slots__ = ("id", "user_id", "weekday", "start_time", "end_time", "is_active", "timezone")
    ID_FIELD_NUMBER: _ClassVar[int]
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    WEEKDAY_FIELD_NUMBER: _ClassVar[int]
    START_TIME_FIELD_NUMBER: _ClassVar[int]
    END_TIME_FIELD_NUMBER: _ClassVar[int]
    IS_ACTIVE_FIELD_NUMBER: _ClassVar[int]
    TIMEZONE_FIELD_NUMBER: _ClassVar[int]
    id: int
    user_id: int
    weekday: int
    start_time: str
    end_time: str
    is_active: bool
    timezone: str
    def __init__(self, id: _Optional[int] = ..., user_id: _Optional[int] = ..., weekday: _Optional[int] = ..., start_time: _Optional[str] = ..., end_time: _Optional[str] = ..., is_active: bool = ..., timezone: _Optional[str] = ...) -> None: ...

class DeleteRuleRequest(_message.Message):
    __slots__ = ("id", "user_id")
    ID_FIELD_NUMBER: _ClassVar[int]
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    id: int
    user_id: int
    def __init__(self, id: _Optional[int] = ..., user_id: _Optional[int] = ...) -> None: ...

class ListExceptionsRequest(_message.Message):
    __slots__ = ("user_id", "to")
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    FROM_FIELD_NUMBER: _ClassVar[int]
    TO_FIELD_NUMBER: _ClassVar[int]
    user_id: int
    to: str
    def __init__(self, user_id: _Optional[int] = ..., to: _Optional[str] = ..., **kwargs) -> None: ...

class ListExceptionsResponse(_message.Message):
    __slots__ = ("exceptions",)
    EXCEPTIONS_FIELD_NUMBER: _ClassVar[int]
    exceptions: _containers.RepeatedCompositeFieldContainer[AvailabilityExceptionModel]
    def __init__(self, exceptions: _Optional[_Iterable[_Union[AvailabilityExceptionModel, _Mapping]]] = ...) -> None: ...

class CreateExceptionRequest(_message.Message):
    __slots__ = ("user_id", "date", "type", "start_time", "end_time", "timezone", "reason")
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    DATE_FIELD_NUMBER: _ClassVar[int]
    TYPE_FIELD_NUMBER: _ClassVar[int]
    START_TIME_FIELD_NUMBER: _ClassVar[int]
    END_TIME_FIELD_NUMBER: _ClassVar[int]
    TIMEZONE_FIELD_NUMBER: _ClassVar[int]
    REASON_FIELD_NUMBER: _ClassVar[int]
    user_id: int
    date: str
    type: str
    start_time: str
    end_time: str
    timezone: str
    reason: str
    def __init__(self, user_id: _Optional[int] = ..., date: _Optional[str] = ..., type: _Optional[str] = ..., start_time: _Optional[str] = ..., end_time: _Optional[str] = ..., timezone: _Optional[str] = ..., reason: _Optional[str] = ...) -> None: ...

class UpdateExceptionRequest(_message.Message):
    __slots__ = ("id", "user_id", "date", "type", "start_time", "end_time", "timezone", "reason")
    ID_FIELD_NUMBER: _ClassVar[int]
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    DATE_FIELD_NUMBER: _ClassVar[int]
    TYPE_FIELD_NUMBER: _ClassVar[int]
    START_TIME_FIELD_NUMBER: _ClassVar[int]
    END_TIME_FIELD_NUMBER: _ClassVar[int]
    TIMEZONE_FIELD_NUMBER: _ClassVar[int]
    REASON_FIELD_NUMBER: _ClassVar[int]
    id: int
    user_id: int
    date: str
    type: str
    start_time: str
    end_time: str
    timezone: str
    reason: str
    def __init__(self, id: _Optional[int] = ..., user_id: _Optional[int] = ..., date: _Optional[str] = ..., type: _Optional[str] = ..., start_time: _Optional[str] = ..., end_time: _Optional[str] = ..., timezone: _Optional[str] = ..., reason: _Optional[str] = ...) -> None: ...

class DeleteExceptionRequest(_message.Message):
    __slots__ = ("id", "user_id")
    ID_FIELD_NUMBER: _ClassVar[int]
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    id: int
    user_id: int
    def __init__(self, id: _Optional[int] = ..., user_id: _Optional[int] = ...) -> None: ...

class SlotModel(_message.Message):
    __slots__ = ("id", "host_id", "event_type_id", "start_at", "end_at", "status", "created_at", "updated_at", "event_type")
    ID_FIELD_NUMBER: _ClassVar[int]
    HOST_ID_FIELD_NUMBER: _ClassVar[int]
    EVENT_TYPE_ID_FIELD_NUMBER: _ClassVar[int]
    START_AT_FIELD_NUMBER: _ClassVar[int]
    END_AT_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    UPDATED_AT_FIELD_NUMBER: _ClassVar[int]
    EVENT_TYPE_FIELD_NUMBER: _ClassVar[int]
    id: str
    host_id: int
    event_type_id: int
    start_at: str
    end_at: str
    status: str
    created_at: str
    updated_at: str
    event_type: EventTypeModel
    def __init__(self, id: _Optional[str] = ..., host_id: _Optional[int] = ..., event_type_id: _Optional[int] = ..., start_at: _Optional[str] = ..., end_at: _Optional[str] = ..., status: _Optional[str] = ..., created_at: _Optional[str] = ..., updated_at: _Optional[str] = ..., event_type: _Optional[_Union[EventTypeModel, _Mapping]] = ...) -> None: ...

class GetAvailableSlotsRequest(_message.Message):
    __slots__ = ("event_type_id", "date")
    EVENT_TYPE_ID_FIELD_NUMBER: _ClassVar[int]
    DATE_FIELD_NUMBER: _ClassVar[int]
    event_type_id: int
    date: str
    def __init__(self, event_type_id: _Optional[int] = ..., date: _Optional[str] = ...) -> None: ...

class ListSlotsResponse(_message.Message):
    __slots__ = ("slots",)
    SLOTS_FIELD_NUMBER: _ClassVar[int]
    slots: _containers.RepeatedCompositeFieldContainer[SlotModel]
    def __init__(self, slots: _Optional[_Iterable[_Union[SlotModel, _Mapping]]] = ...) -> None: ...

class ListSlotsForHostRequest(_message.Message):
    __slots__ = ("host_id", "to")
    HOST_ID_FIELD_NUMBER: _ClassVar[int]
    FROM_FIELD_NUMBER: _ClassVar[int]
    TO_FIELD_NUMBER: _ClassVar[int]
    host_id: int
    to: str
    def __init__(self, host_id: _Optional[int] = ..., to: _Optional[str] = ..., **kwargs) -> None: ...

class CreateSlotRequest(_message.Message):
    __slots__ = ("host_id", "event_type_id", "start_at", "end_at")
    HOST_ID_FIELD_NUMBER: _ClassVar[int]
    EVENT_TYPE_ID_FIELD_NUMBER: _ClassVar[int]
    START_AT_FIELD_NUMBER: _ClassVar[int]
    END_AT_FIELD_NUMBER: _ClassVar[int]
    host_id: int
    event_type_id: int
    start_at: str
    end_at: str
    def __init__(self, host_id: _Optional[int] = ..., event_type_id: _Optional[int] = ..., start_at: _Optional[str] = ..., end_at: _Optional[str] = ...) -> None: ...

class RegenerateSlotsRequest(_message.Message):
    __slots__ = ("host_id", "to")
    HOST_ID_FIELD_NUMBER: _ClassVar[int]
    FROM_FIELD_NUMBER: _ClassVar[int]
    TO_FIELD_NUMBER: _ClassVar[int]
    host_id: int
    to: str
    def __init__(self, host_id: _Optional[int] = ..., to: _Optional[str] = ..., **kwargs) -> None: ...

class RegenerateSlotsResponse(_message.Message):
    __slots__ = ("success", "generated_count", "message")
    SUCCESS_FIELD_NUMBER: _ClassVar[int]
    GENERATED_COUNT_FIELD_NUMBER: _ClassVar[int]
    MESSAGE_FIELD_NUMBER: _ClassVar[int]
    success: bool
    generated_count: int
    message: str
    def __init__(self, success: bool = ..., generated_count: _Optional[int] = ..., message: _Optional[str] = ...) -> None: ...

class UpdateSlotRequest(_message.Message):
    __slots__ = ("id", "host_id", "event_type_id", "start_at", "end_at", "status")
    ID_FIELD_NUMBER: _ClassVar[int]
    HOST_ID_FIELD_NUMBER: _ClassVar[int]
    EVENT_TYPE_ID_FIELD_NUMBER: _ClassVar[int]
    START_AT_FIELD_NUMBER: _ClassVar[int]
    END_AT_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    id: str
    host_id: int
    event_type_id: int
    start_at: str
    end_at: str
    status: str
    def __init__(self, id: _Optional[str] = ..., host_id: _Optional[int] = ..., event_type_id: _Optional[int] = ..., start_at: _Optional[str] = ..., end_at: _Optional[str] = ..., status: _Optional[str] = ...) -> None: ...

class DeleteSlotRequest(_message.Message):
    __slots__ = ("id", "host_id")
    ID_FIELD_NUMBER: _ClassVar[int]
    HOST_ID_FIELD_NUMBER: _ClassVar[int]
    id: str
    host_id: int
    def __init__(self, id: _Optional[str] = ..., host_id: _Optional[int] = ...) -> None: ...

class BookingModel(_message.Message):
    __slots__ = ("id", "host_id", "event_type_id", "slot_id", "invitee_email", "invitee_name", "invitee_notes", "status", "meet_link", "calendar_event_id", "cancelled_at", "created_at", "updated_at", "slot", "event_type", "host")
    ID_FIELD_NUMBER: _ClassVar[int]
    HOST_ID_FIELD_NUMBER: _ClassVar[int]
    EVENT_TYPE_ID_FIELD_NUMBER: _ClassVar[int]
    SLOT_ID_FIELD_NUMBER: _ClassVar[int]
    INVITEE_EMAIL_FIELD_NUMBER: _ClassVar[int]
    INVITEE_NAME_FIELD_NUMBER: _ClassVar[int]
    INVITEE_NOTES_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    MEET_LINK_FIELD_NUMBER: _ClassVar[int]
    CALENDAR_EVENT_ID_FIELD_NUMBER: _ClassVar[int]
    CANCELLED_AT_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    UPDATED_AT_FIELD_NUMBER: _ClassVar[int]
    SLOT_FIELD_NUMBER: _ClassVar[int]
    EVENT_TYPE_FIELD_NUMBER: _ClassVar[int]
    HOST_FIELD_NUMBER: _ClassVar[int]
    id: int
    host_id: int
    event_type_id: int
    slot_id: str
    invitee_email: str
    invitee_name: str
    invitee_notes: str
    status: str
    meet_link: str
    calendar_event_id: str
    cancelled_at: str
    created_at: str
    updated_at: str
    slot: SlotModel
    event_type: EventTypeModel
    host: UserModel
    def __init__(self, id: _Optional[int] = ..., host_id: _Optional[int] = ..., event_type_id: _Optional[int] = ..., slot_id: _Optional[str] = ..., invitee_email: _Optional[str] = ..., invitee_name: _Optional[str] = ..., invitee_notes: _Optional[str] = ..., status: _Optional[str] = ..., meet_link: _Optional[str] = ..., calendar_event_id: _Optional[str] = ..., cancelled_at: _Optional[str] = ..., created_at: _Optional[str] = ..., updated_at: _Optional[str] = ..., slot: _Optional[_Union[SlotModel, _Mapping]] = ..., event_type: _Optional[_Union[EventTypeModel, _Mapping]] = ..., host: _Optional[_Union[UserModel, _Mapping]] = ...) -> None: ...

class ListBookingsRequest(_message.Message):
    __slots__ = ("host_id",)
    HOST_ID_FIELD_NUMBER: _ClassVar[int]
    host_id: int
    def __init__(self, host_id: _Optional[int] = ...) -> None: ...

class ListBookingsResponse(_message.Message):
    __slots__ = ("bookings",)
    BOOKINGS_FIELD_NUMBER: _ClassVar[int]
    bookings: _containers.RepeatedCompositeFieldContainer[BookingModel]
    def __init__(self, bookings: _Optional[_Iterable[_Union[BookingModel, _Mapping]]] = ...) -> None: ...

class GetBookingRequest(_message.Message):
    __slots__ = ("id", "host_id")
    ID_FIELD_NUMBER: _ClassVar[int]
    HOST_ID_FIELD_NUMBER: _ClassVar[int]
    id: int
    host_id: int
    def __init__(self, id: _Optional[int] = ..., host_id: _Optional[int] = ...) -> None: ...

class CreateBookingRequest(_message.Message):
    __slots__ = ("event_type_id", "slot_id", "invitee_name", "invitee_email", "invitee_notes")
    EVENT_TYPE_ID_FIELD_NUMBER: _ClassVar[int]
    SLOT_ID_FIELD_NUMBER: _ClassVar[int]
    INVITEE_NAME_FIELD_NUMBER: _ClassVar[int]
    INVITEE_EMAIL_FIELD_NUMBER: _ClassVar[int]
    INVITEE_NOTES_FIELD_NUMBER: _ClassVar[int]
    event_type_id: int
    slot_id: str
    invitee_name: str
    invitee_email: str
    invitee_notes: str
    def __init__(self, event_type_id: _Optional[int] = ..., slot_id: _Optional[str] = ..., invitee_name: _Optional[str] = ..., invitee_email: _Optional[str] = ..., invitee_notes: _Optional[str] = ...) -> None: ...

class CancelBookingRequest(_message.Message):
    __slots__ = ("id", "host_id")
    ID_FIELD_NUMBER: _ClassVar[int]
    HOST_ID_FIELD_NUMBER: _ClassVar[int]
    id: int
    host_id: int
    def __init__(self, id: _Optional[int] = ..., host_id: _Optional[int] = ...) -> None: ...

class EnrollerModel(_message.Message):
    __slots__ = ("id", "auth_id", "email", "name", "created_at", "updated_at")
    ID_FIELD_NUMBER: _ClassVar[int]
    AUTH_ID_FIELD_NUMBER: _ClassVar[int]
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    UPDATED_AT_FIELD_NUMBER: _ClassVar[int]
    id: int
    auth_id: str
    email: str
    name: str
    created_at: str
    updated_at: str
    def __init__(self, id: _Optional[int] = ..., auth_id: _Optional[str] = ..., email: _Optional[str] = ..., name: _Optional[str] = ..., created_at: _Optional[str] = ..., updated_at: _Optional[str] = ...) -> None: ...

class SubscriptionModel(_message.Message):
    __slots__ = ("id", "enroller_id", "event_type_id", "created_at", "event_type")
    ID_FIELD_NUMBER: _ClassVar[int]
    ENROLLER_ID_FIELD_NUMBER: _ClassVar[int]
    EVENT_TYPE_ID_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    EVENT_TYPE_FIELD_NUMBER: _ClassVar[int]
    id: int
    enroller_id: int
    event_type_id: int
    created_at: str
    event_type: EventTypeModel
    def __init__(self, id: _Optional[int] = ..., enroller_id: _Optional[int] = ..., event_type_id: _Optional[int] = ..., created_at: _Optional[str] = ..., event_type: _Optional[_Union[EventTypeModel, _Mapping]] = ...) -> None: ...

class SlotRequestModel(_message.Message):
    __slots__ = ("id", "enroller_id", "event_type_id", "message", "status", "created_at", "enroller", "event_type")
    ID_FIELD_NUMBER: _ClassVar[int]
    ENROLLER_ID_FIELD_NUMBER: _ClassVar[int]
    EVENT_TYPE_ID_FIELD_NUMBER: _ClassVar[int]
    MESSAGE_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    ENROLLER_FIELD_NUMBER: _ClassVar[int]
    EVENT_TYPE_FIELD_NUMBER: _ClassVar[int]
    id: int
    enroller_id: int
    event_type_id: int
    message: str
    status: str
    created_at: str
    enroller: EnrollerModel
    event_type: EventTypeModel
    def __init__(self, id: _Optional[int] = ..., enroller_id: _Optional[int] = ..., event_type_id: _Optional[int] = ..., message: _Optional[str] = ..., status: _Optional[str] = ..., created_at: _Optional[str] = ..., enroller: _Optional[_Union[EnrollerModel, _Mapping]] = ..., event_type: _Optional[_Union[EventTypeModel, _Mapping]] = ...) -> None: ...

class CreateEnrollerRequest(_message.Message):
    __slots__ = ("email", "name", "auth_id")
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    AUTH_ID_FIELD_NUMBER: _ClassVar[int]
    email: str
    name: str
    auth_id: str
    def __init__(self, email: _Optional[str] = ..., name: _Optional[str] = ..., auth_id: _Optional[str] = ...) -> None: ...

class SubscribeRequest(_message.Message):
    __slots__ = ("enroller_id", "event_type_id")
    ENROLLER_ID_FIELD_NUMBER: _ClassVar[int]
    EVENT_TYPE_ID_FIELD_NUMBER: _ClassVar[int]
    enroller_id: int
    event_type_id: int
    def __init__(self, enroller_id: _Optional[int] = ..., event_type_id: _Optional[int] = ...) -> None: ...

class SlotRequestCreateRequest(_message.Message):
    __slots__ = ("enroller_id", "event_type_id", "message")
    ENROLLER_ID_FIELD_NUMBER: _ClassVar[int]
    EVENT_TYPE_ID_FIELD_NUMBER: _ClassVar[int]
    MESSAGE_FIELD_NUMBER: _ClassVar[int]
    enroller_id: int
    event_type_id: int
    message: str
    def __init__(self, enroller_id: _Optional[int] = ..., event_type_id: _Optional[int] = ..., message: _Optional[str] = ...) -> None: ...

class ListSubscriptionsRequest(_message.Message):
    __slots__ = ("enroller_id",)
    ENROLLER_ID_FIELD_NUMBER: _ClassVar[int]
    enroller_id: int
    def __init__(self, enroller_id: _Optional[int] = ...) -> None: ...

class ListSubscriptionsResponse(_message.Message):
    __slots__ = ("subscriptions",)
    SUBSCRIPTIONS_FIELD_NUMBER: _ClassVar[int]
    subscriptions: _containers.RepeatedCompositeFieldContainer[SubscriptionModel]
    def __init__(self, subscriptions: _Optional[_Iterable[_Union[SubscriptionModel, _Mapping]]] = ...) -> None: ...

class ListSlotRequestsRequest(_message.Message):
    __slots__ = ("teacher_user_id",)
    TEACHER_USER_ID_FIELD_NUMBER: _ClassVar[int]
    teacher_user_id: int
    def __init__(self, teacher_user_id: _Optional[int] = ...) -> None: ...

class ListSlotRequestsResponse(_message.Message):
    __slots__ = ("slot_requests",)
    SLOT_REQUESTS_FIELD_NUMBER: _ClassVar[int]
    slot_requests: _containers.RepeatedCompositeFieldContainer[SlotRequestModel]
    def __init__(self, slot_requests: _Optional[_Iterable[_Union[SlotRequestModel, _Mapping]]] = ...) -> None: ...
