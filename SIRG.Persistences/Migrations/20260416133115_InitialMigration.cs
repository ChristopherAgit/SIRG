using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SIRG.Persistences.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    CategoryID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CategoryName = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.CategoryID);
                });

            migrationBuilder.CreateTable(
                name: "Customers",
                columns: table => new
                {
                    CustomerID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FullName = table.Column<string>(type: "text", nullable: false),
                    Phone = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customers", x => x.CustomerID);
                });

            migrationBuilder.CreateTable(
                name: "Ingredients",
                columns: table => new
                {
                    IngredientId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IngredientName = table.Column<string>(type: "text", nullable: false),
                    Unit = table.Column<string>(type: "text", nullable: false),
                    MinimunStock = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ingredients", x => x.IngredientId);
                });

            migrationBuilder.CreateTable(
                name: "MeseroSessions",
                columns: table => new
                {
                    ServiceId = table.Column<string>(type: "text", nullable: false),
                    TableId = table.Column<string>(type: "text", nullable: true),
                    TableNumber = table.Column<int>(type: "integer", nullable: false),
                    OpenedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MeseroSessions", x => x.ServiceId);
                });

            migrationBuilder.CreateTable(
                name: "OrderStatus",
                columns: table => new
                {
                    StatusID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StatusName = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderStatus", x => x.StatusID);
                });

            migrationBuilder.CreateTable(
                name: "ReservationStatus",
                columns: table => new
                {
                    StatusID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StatusName = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReservationStatus", x => x.StatusID);
                });

            migrationBuilder.CreateTable(
                name: "RestaurantTables",
                columns: table => new
                {
                    TableID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TableNumber = table.Column<int>(type: "integer", nullable: false),
                    Capacity = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RestaurantTables", x => x.TableID);
                });

            migrationBuilder.CreateTable(
                name: "Sales",
                columns: table => new
                {
                    SaleID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    OrderID = table.Column<int>(type: "integer", nullable: false),
                    SaleDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TotalAmount = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sales", x => x.SaleID);
                });

            migrationBuilder.CreateTable(
                name: "Dishes",
                columns: table => new
                {
                    DishID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CategoryID = table.Column<string>(type: "text", nullable: false),
                    DishName = table.Column<string>(type: "text", nullable: false),
                    Price = table.Column<decimal>(type: "numeric", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CategoryID1 = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Dishes", x => x.DishID);
                    table.ForeignKey(
                        name: "FK_Dishes_Categories_CategoryID1",
                        column: x => x.CategoryID1,
                        principalTable: "Categories",
                        principalColumn: "CategoryID");
                });

            migrationBuilder.CreateTable(
                name: "Inventory",
                columns: table => new
                {
                    InventoryID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IngredientID = table.Column<int>(type: "integer", nullable: false),
                    CurrentStock = table.Column<decimal>(type: "numeric", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Inventory", x => x.InventoryID);
                    table.ForeignKey(
                        name: "FK_Inventory_Ingredients_IngredientID",
                        column: x => x.IngredientID,
                        principalTable: "Ingredients",
                        principalColumn: "IngredientId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InventoryMovements",
                columns: table => new
                {
                    MovementID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IngredientID = table.Column<int>(type: "integer", nullable: false),
                    MovementType = table.Column<string>(type: "text", nullable: true),
                    Quantity = table.Column<decimal>(type: "numeric", nullable: false),
                    MovementDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Reference = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventoryMovements", x => x.MovementID);
                    table.ForeignKey(
                        name: "FK_InventoryMovements_Ingredients_IngredientID",
                        column: x => x.IngredientID,
                        principalTable: "Ingredients",
                        principalColumn: "IngredientId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Reservations",
                columns: table => new
                {
                    ReservationID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TableID = table.Column<int>(type: "integer", nullable: false),
                    StatusID = table.Column<int>(type: "integer", nullable: false),
                    ReservationDate = table.Column<DateOnly>(type: "date", nullable: false),
                    ReservationTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    NumberOfPeople = table.Column<int>(type: "integer", nullable: false),
                    CustomersCustomerID = table.Column<int>(type: "integer", nullable: true),
                    ConfirmationToken = table.Column<string>(type: "text", nullable: true),
                    IsConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    ConfirmedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RestaurantTablesTableID = table.Column<int>(type: "integer", nullable: true),
                    ReservationStatusStatusID = table.Column<int>(type: "integer", nullable: true),
                    CustomersCustomerID1 = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reservations", x => x.ReservationID);
                    table.ForeignKey(
                        name: "FK_Reservations_Customers_CustomersCustomerID1",
                        column: x => x.CustomersCustomerID1,
                        principalTable: "Customers",
                        principalColumn: "CustomerID");
                    table.ForeignKey(
                        name: "FK_Reservations_ReservationStatus_ReservationStatusStatusID",
                        column: x => x.ReservationStatusStatusID,
                        principalTable: "ReservationStatus",
                        principalColumn: "StatusID");
                    table.ForeignKey(
                        name: "FK_Reservations_RestaurantTables_RestaurantTablesTableID",
                        column: x => x.RestaurantTablesTableID,
                        principalTable: "RestaurantTables",
                        principalColumn: "TableID");
                });

            migrationBuilder.CreateTable(
                name: "DishIngredients",
                columns: table => new
                {
                    DishIngredientsId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DishID = table.Column<int>(type: "integer", nullable: false),
                    IngredientID = table.Column<int>(type: "integer", nullable: false),
                    QuantityRequired = table.Column<decimal>(type: "numeric", nullable: true),
                    IngredientsIngredientId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DishIngredients", x => x.DishIngredientsId);
                    table.ForeignKey(
                        name: "FK_DishIngredients_Dishes_DishID",
                        column: x => x.DishID,
                        principalTable: "Dishes",
                        principalColumn: "DishID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DishIngredients_Ingredients_IngredientsIngredientId",
                        column: x => x.IngredientsIngredientId,
                        principalTable: "Ingredients",
                        principalColumn: "IngredientId");
                });

            migrationBuilder.CreateTable(
                name: "SaleDetails",
                columns: table => new
                {
                    SaleDetailsID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SaleID = table.Column<int>(type: "integer", nullable: false),
                    DishID = table.Column<int>(type: "integer", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric", nullable: false),
                    SalesSaleID = table.Column<int>(type: "integer", nullable: true),
                    DishesDishID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SaleDetails", x => x.SaleDetailsID);
                    table.ForeignKey(
                        name: "FK_SaleDetails_Dishes_DishesDishID",
                        column: x => x.DishesDishID,
                        principalTable: "Dishes",
                        principalColumn: "DishID");
                    table.ForeignKey(
                        name: "FK_SaleDetails_Sales_SalesSaleID",
                        column: x => x.SalesSaleID,
                        principalTable: "Sales",
                        principalColumn: "SaleID");
                });

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    OrderID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ReservationID = table.Column<int>(type: "integer", nullable: false),
                    WaiterID = table.Column<int>(type: "integer", nullable: false),
                    StatusID = table.Column<int>(type: "integer", nullable: false),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    OrderDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReservationsReservationID = table.Column<int>(type: "integer", nullable: true),
                    OrderStatusStatusID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orders", x => x.OrderID);
                    table.ForeignKey(
                        name: "FK_Orders_OrderStatus_OrderStatusStatusID",
                        column: x => x.OrderStatusStatusID,
                        principalTable: "OrderStatus",
                        principalColumn: "StatusID");
                    table.ForeignKey(
                        name: "FK_Orders_Reservations_ReservationsReservationID",
                        column: x => x.ReservationsReservationID,
                        principalTable: "Reservations",
                        principalColumn: "ReservationID");
                });

            migrationBuilder.CreateTable(
                name: "OrderDetails",
                columns: table => new
                {
                    OrderDetailsID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    OrderID = table.Column<int>(type: "integer", nullable: false),
                    DishID = table.Column<int>(type: "integer", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric", nullable: false),
                    OrdersOrderID = table.Column<int>(type: "integer", nullable: true),
                    DishesDishID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderDetails", x => x.OrderDetailsID);
                    table.ForeignKey(
                        name: "FK_OrderDetails_Dishes_DishesDishID",
                        column: x => x.DishesDishID,
                        principalTable: "Dishes",
                        principalColumn: "DishID");
                    table.ForeignKey(
                        name: "FK_OrderDetails_Orders_OrdersOrderID",
                        column: x => x.OrdersOrderID,
                        principalTable: "Orders",
                        principalColumn: "OrderID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Dishes_CategoryID1",
                table: "Dishes",
                column: "CategoryID1");

            migrationBuilder.CreateIndex(
                name: "IX_DishIngredients_DishID",
                table: "DishIngredients",
                column: "DishID");

            migrationBuilder.CreateIndex(
                name: "IX_DishIngredients_IngredientsIngredientId",
                table: "DishIngredients",
                column: "IngredientsIngredientId");

            migrationBuilder.CreateIndex(
                name: "IX_Inventory_IngredientID",
                table: "Inventory",
                column: "IngredientID");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryMovements_IngredientID",
                table: "InventoryMovements",
                column: "IngredientID");

            migrationBuilder.CreateIndex(
                name: "IX_OrderDetails_DishesDishID",
                table: "OrderDetails",
                column: "DishesDishID");

            migrationBuilder.CreateIndex(
                name: "IX_OrderDetails_OrdersOrderID",
                table: "OrderDetails",
                column: "OrdersOrderID");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_OrderStatusStatusID",
                table: "Orders",
                column: "OrderStatusStatusID");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_ReservationsReservationID",
                table: "Orders",
                column: "ReservationsReservationID");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_CustomersCustomerID1",
                table: "Reservations",
                column: "CustomersCustomerID1");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_ReservationStatusStatusID",
                table: "Reservations",
                column: "ReservationStatusStatusID");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_RestaurantTablesTableID",
                table: "Reservations",
                column: "RestaurantTablesTableID");

            migrationBuilder.CreateIndex(
                name: "IX_SaleDetails_DishesDishID",
                table: "SaleDetails",
                column: "DishesDishID");

            migrationBuilder.CreateIndex(
                name: "IX_SaleDetails_SalesSaleID",
                table: "SaleDetails",
                column: "SalesSaleID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DishIngredients");

            migrationBuilder.DropTable(
                name: "Inventory");

            migrationBuilder.DropTable(
                name: "InventoryMovements");

            migrationBuilder.DropTable(
                name: "MeseroSessions");

            migrationBuilder.DropTable(
                name: "OrderDetails");

            migrationBuilder.DropTable(
                name: "SaleDetails");

            migrationBuilder.DropTable(
                name: "Ingredients");

            migrationBuilder.DropTable(
                name: "Orders");

            migrationBuilder.DropTable(
                name: "Dishes");

            migrationBuilder.DropTable(
                name: "Sales");

            migrationBuilder.DropTable(
                name: "OrderStatus");

            migrationBuilder.DropTable(
                name: "Reservations");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "Customers");

            migrationBuilder.DropTable(
                name: "ReservationStatus");

            migrationBuilder.DropTable(
                name: "RestaurantTables");
        }
    }
}
