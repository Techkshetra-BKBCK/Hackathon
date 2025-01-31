import customtkinter


class App(customtkinter.CTk):
    def __init__(self):
        super().__init__()
        self.geometry('800x800')
        self.title('My App')
        self.frame=customtkinter.CTkFrame(self)
        self.frame.pack(fill='both',expand=True)
        self.frame.configure(fg_color='white')
        self.Name_label=customtkinter.CTkLabel(self.frame,text='Name:')
        self.Name=customtkinter.CTkEntry(self.frame)
        self.Name_label.pack()
        self.Name_label.place(relx=0.5,rely=0.01)
        self.Name.pack()
        self.Name.place(relwidth=0.8,relheight=0.05,relx=0.01,rely=0.1)
        self.Login_page=customtkinter.CTkButton(self.frame,text='Login')
        self.Login_page.pack()
        self.Login_page.place(relwidth=0.1,relheight=0.05,relx=0.5,rely=0.5)
        self.mainloop()

        
    
    

    customtkinter.set_appearance_mode('dark')
    customtkinter.set_default_color_theme('green')


App()
