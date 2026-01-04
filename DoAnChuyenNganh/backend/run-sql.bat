@echo off
echo Running SQL script to create MaGiamGia table...
echo.
echo Please enter your MySQL password when prompted
echo.

mysql -u root -p laptopworld < scripts\create_magiamgia_table.sql

echo.
echo Done! Press any key to exit...
pause
