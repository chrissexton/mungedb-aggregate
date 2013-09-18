"use strict";

/*
 * This file defines valid error codes used by mongo
 * mongo/base/error_codes.err
 **/

// Error codes
var ERROR_CODES = {
	OK                         : {name:"OK"                         , code: 0},
	InternalError              : {name:"InternalError"              , code: 1},
	BadValue                   : {name:"BadValue"                   , code: 2},
	DuplicateKey               : {name:"DuplicateKey"               , code: 3},
	NoSuchKey                  : {name:"NoSuchKey"                  , code: 4},
	GraphContainsCycle         : {name:"GraphContainsCycle"         , code: 5},
	HostUnreachable            : {name:"HostUnreachable"            , code: 6},
	HostNotFound               : {name:"HostNotFound"               , code: 7},
	UnknownError               : {name:"UnknownError"               , code: 8},
	FailedToParse              : {name:"FailedToParse"              , code: 9},
	CannotMutateObject         : {name:"CannotMutateObject"         , code: 10},
	UserNotFound               : {name:"UserNotFound"               , code: 11},
	UnsupportedFormat          : {name:"UnsupportedFormat"          , code: 12},
	Unauthorized               : {name:"Unauthorized"               , code: 13},
	TypeMismatch               : {name:"TypeMismatch"               , code: 14},
	Overflow                   : {name:"Overflow"                   , code: 15},
	InvalidLength              : {name:"InvalidLength"              , code: 16},
	ProtocolError              : {name:"ProtocolError"              , code: 17},
	AuthenticationFailed       : {name:"AuthenticationFailed"       , code: 18},
	CannotReuseObject          : {name:"CannotReuseObject"          , code: 19},
	IllegalOperation           : {name:"IllegalOperation"           , code: 20},
	EmptyArrayOperation        : {name:"EmptyArrayOperation"        , code: 21},
	InvalidBSON                : {name:"InvalidBSON"                , code: 22},
	AlreadyInitialized         : {name:"AlreadyInitialized"         , code: 23},
	LockTimeout                : {name:"LockTimeout"                , code: 24},
	RemoteValidationError      : {name:"RemoteValidationError"      , code: 25},
	NamespaceNotFound          : {name:"NamespaceNotFound"          , code: 26},
	IndexNotFound              : {name:"IndexNotFound"              , code: 27},
	PathNotViable              : {name:"PathNotViable"              , code: 28},
	NonExistentPath            : {name:"NonExistentPath"            , code: 29},
	InvalidPath                : {name:"InvalidPath"                , code: 30},
	RoleNotFound               : {name:"RoleNotFound"               , code: 31},
	RolesNotRelated            : {name:"RolesNotRelated"            , code: 32},
	PrivilegeNotFound          : {name:"PrivilegeNotFound"          , code: 33},
	CannotBackfillArray        : {name:"CannotBackfillArray"        , code: 34},
	UserModificationFailed     : {name:"UserModificationFailed"     , code: 35},
	RemoteChangeDetected       : {name:"RemoteChangeDetected"       , code: 36},
	FileRenameFailed           : {name:"FileRenameFailed"           , code: 37},
	FileNotOpen                : {name:"FileNotOpen"                , code: 38},
	FileStreamFailed           : {name:"FileStreamFailed"           , code: 39},
	ConflictingUpdateOperators : {name:"ConflictingUpdateOperators" , code: 40},
	FileAlreadyOpen            : {name:"FileAlreadyOpen"            , code: 41},
	LogWriteFailed             : {name:"LogWriteFailed"             , code: 42},
	CursorNotFound             : {name:"CursorNotFound"             , code: 43},
	KeyNotFound                : {name:"KeyNotFound"                , code: 44},
},

// Classes of errors
ERROR_CLASS = {
	NetworkError: {name:"NetworkError", codes: ["HostUnreachable", "HostNotFound"]},
};

module.exports = {
	ERROR_CODES: ERROR_CODES,
	ERROR_CLASS: ERROR_CLASS
};
