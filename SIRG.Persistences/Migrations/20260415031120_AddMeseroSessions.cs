using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SIRG.Persistences.Migrations
{
    /// <inheritdoc />
    public partial class AddMeseroSessions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MeseroSessions",
                columns: table => new
                {
                    ServiceId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    TableId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TableNumber = table.Column<int>(type: "int", nullable: false),
                    OpenedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MeseroSessions", x => x.ServiceId);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MeseroSessions");
        }
    }
}
