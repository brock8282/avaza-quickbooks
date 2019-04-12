export interface IObjectMap<T> {
    [key: string]: T;
}

export interface IAuthCredential {
    id?: string;
    access_token: string;
    refresh_token: string;
    token_type?: string;
    x_refresh_token_expires_in?: string;
    id_token?: string;
}

export interface ITimeTracking {
    NameOf: 'Employee',
    EmployeeRef: {
        value: string,
        name: string
    },
    StartTime: string,
    EndTime: string
}

export interface IQbooksEmployee {
    BillableTime: boolean,
    domain: string;
    sparse: boolean,
    Id: string;
    SyncToken: string;
    MetaData: {
        CreateTime: string;
        LastUpdatedTime: string;
    },
    GivenName:string;
    FamilyName: string;
    DisplayName: string;
    PrintOnCheckName: string;
    Active: boolean,
    PrimaryPhone: {
        FreeFormNumber: string;
    },
    PrimaryEmailAddr: {
        Address: string;
    }
}

export interface ITimeSheetEvent {
    TimeSheetEntryID: number;
    Duration: number;
    EntryDate: string;
    UserIDFK: number;
    ProjectIDFK: number;
    TimeSheetCategoryIDFK: number;
    Notes: any;
    TimeSheetEntryApprovalStatusCode: string;
    isBillable: boolean;
    isInvoiced: boolean;
    DateCreated: string;
    DateUpdated: string;
    WebhookNotificationItemID: number;
    SubscriptionID: number
}

export interface IAvazaUserProfile {
    UserID: number,
    AccountIDFK: number,
    Email: string,
    Firstname: string,
    Lastname: string,
    TimeZone: string,
    isTeamMember: true,
    CompanyIDFK: number,
    CompanyName: string,
    DefaultBillableRate: number,
    DefaultCostRate: number,
    MondayAvailableHours: number,
    TuesdayAvailableHours: number,
    WednesdayAvailableHours: number,
    ThursdayAvailableHours: number,
    FridayAvailableHours: number,
    SaturdayAvailableHours: number,
    SundayAvailableHours: number,
    Roles: [
        {
            RoleCode: string,
            RoleName: string
        }
    ],
    Tags: [
        {
            UserTagID: number,
            UserTagName: string
        }
    ]
}
