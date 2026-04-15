using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SIRG.Persistences.Migrations
{
    /// <inheritdoc />
    public partial class secondMigratio : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reservations_Customers_CustomersCustomerID",
                table: "Reservations");

            migrationBuilder.DropIndex(
                name: "IX_Reservations_CustomersCustomerID",
                table: "Reservations");

            migrationBuilder.AddColumn<string>(
                name: "ConfirmationToken",
                table: "Reservations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ConfirmedAt",
                table: "Reservations",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CustomersCustomerID1",
                table: "Reservations",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsConfirmed",
                table: "Reservations",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_CustomersCustomerID1",
                table: "Reservations",
                column: "CustomersCustomerID1");

            migrationBuilder.AddForeignKey(
                name: "FK_Reservations_Customers_CustomersCustomerID1",
                table: "Reservations",
                column: "CustomersCustomerID1",
                principalTable: "Customers",
                principalColumn: "CustomerID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reservations_Customers_CustomersCustomerID1",
                table: "Reservations");

            migrationBuilder.DropIndex(
                name: "IX_Reservations_CustomersCustomerID1",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "ConfirmationToken",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "ConfirmedAt",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "CustomersCustomerID1",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "IsConfirmed",
                table: "Reservations");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_CustomersCustomerID",
                table: "Reservations",
                column: "CustomersCustomerID");

            migrationBuilder.AddForeignKey(
                name: "FK_Reservations_Customers_CustomersCustomerID",
                table: "Reservations",
                column: "CustomersCustomerID",
                principalTable: "Customers",
                principalColumn: "CustomerID");
        }
    }
}
