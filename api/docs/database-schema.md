# Database schema

This diagram is generated from `prisma/schema.prisma`.

```mermaid
erDiagram
    USER {
        string id PK
        string name
        string email UK
        string password
        Role role
        string phoneNumber
        string imageUrl "nullable"
        string refreshTokenHash "nullable"
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    SHOP_OWNER {
        string userId PK,FK
    }

    DELIVERY_COMPANY {
        string userId PK,FK
        decimal deliveryPrice
        string openTime
        string closeTime
        DeliveryZone[] coverageZones
    }

    DRIVER {
        string userId PK,FK
        string companyId FK
    }

    PRODUCT {
        string id PK
        string name
        string description "nullable"
        decimal price
        string[] imageUrls
        boolean isActive
        string shopOwnerId FK
        datetime createdAt
        datetime updatedAt
    }

    ORDER {
        string id PK
        string shopOwnerId FK
        string deliveryCompanyId FK "nullable"
        string driverId FK "nullable"
        string customerName
        string customerPhone
        string customerAddress
        string customerNote "nullable"
        decimal customerLatitude "nullable"
        decimal customerLongitude "nullable"
        decimal totalPrice
        decimal deliveryFee
        decimal shopCommission
        decimal deliveryCompanyCommission
        decimal customerTotal
        string pickupCode UK
        boolean pickupCodeUsed
        DeliveryZone deliveryZone "nullable"
        OrderStatus status
        PaymentStatus paymentStatus
        string returnReason "nullable"
        string rejectionReason "nullable"
        datetime createdAt
        datetime updatedAt
    }

    ORDER_ITEM {
        string id PK
        string orderId FK
        string productId FK
        int quantity
    }

    USER ||--o| SHOP_OWNER : "has profile"
    USER ||--o| DELIVERY_COMPANY : "has profile"
    USER ||--o| DRIVER : "has profile"

    DELIVERY_COMPANY ||--o{ DRIVER : employs
    SHOP_OWNER ||--o{ PRODUCT : owns
    SHOP_OWNER ||--o{ ORDER : receives
    DELIVERY_COMPANY o|--o{ ORDER : fulfills
    DRIVER o|--o{ ORDER : delivers
    ORDER ||--o{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : appears_in
```

## Relationship map

| Parent | Child | Relationship | Foreign key |
|---|---|---|---|
| `User` | `ShopOwner` | one to zero-or-one | `ShopOwner.userId -> User.id` |
| `User` | `DeliveryCompany` | one to zero-or-one | `DeliveryCompany.userId -> User.id` |
| `User` | `Driver` | one to zero-or-one | `Driver.userId -> User.id` |
| `DeliveryCompany` | `Driver` | one to many | `Driver.companyId -> DeliveryCompany.userId` |
| `ShopOwner` | `Product` | one to many | `Product.shopOwnerId -> ShopOwner.userId` |
| `ShopOwner` | `Order` | one to many | `Order.shopOwnerId -> ShopOwner.userId` |
| `DeliveryCompany` | `Order` | one to many, optional on order | `Order.deliveryCompanyId -> DeliveryCompany.userId` |
| `Driver` | `Order` | one to many, optional on order | `Order.driverId -> Driver.userId` |
| `Order` | `OrderItem` | one to many | `OrderItem.orderId -> Order.id` |
| `Product` | `OrderItem` | one to many | `OrderItem.productId -> Product.id` |

`OrderItem` is the join model between `Order` and `Product`, so orders and products have a many-to-many relationship with `quantity` stored on the join record.
