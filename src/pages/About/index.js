import React from 'react';
import { Link } from 'react-router-dom';
import './About.scss';

function About() {
    return (
        <div className="about-page">
            <section className="about-hero">
                <div className="about-hero-inner container">
                    <div className="about-copy">
                        <span className="about-tag">VỀ SHOEVIET</span>
                        <h1>Chúng tôi là nơi khởi nguồn của phong cách và hiệu suất cho đôi chân Việt.</h1>
                        <p>
                            SHOEVIET xây dựng bộ sưu tập giày thể thao thời thượng, bền bỉ và phù hợp với nhịp sống năng động.
                            Mỗi thiết kế đều được chọn lọc kỹ lưỡng để mang đến sự tự tin, thoải mái và phong thái khác biệt.
                        </p>
                        <div className="about-actions">
                            <Link className="btn-primary" to="/product">Khám phá ngay</Link>
                            <Link className="btn-secondary" to="/product">Bộ sưu tập</Link>
                        </div>
                    </div>
                    <div className="about-visual">
                        <img
                            src="https://png.pngtree.com/background/20230526/original/pngtree-glowing-pair-of-white-shoes-with-glow-in-the-dark-picture-image_2749065.jpg"
                            alt="Giày SHOEVIET"
                        />
                    </div>
                </div>
            </section>

            <section className="about-values container">
                <div className="section-header">
                    <h2>Giá trị cốt lõi</h2>
                    <p>
                        Chúng tôi tin rằng mỗi đôi giày không chỉ là vật dụng, mà còn là biểu tượng của phong cách,
                        sự tự tin và hành trình cá nhân.
                    </p>
                </div>
                <div className="values-grid">
                    <div className="value-card">
                        <h3>Thiết kế tinh tế</h3>
                        <p>
                            Mỗi sản phẩm được thiết kế với đường nét hiện đại, phù hợp với thị hiếu người Việt và
                            xu hướng thời trang quốc tế.
                        </p>
                    </div>
                    <div className="value-card">
                        <h3>Chất lượng tin cậy</h3>
                        <p>
                            Chọn lựa nguyên liệu bền bỉ và gia công tỉ mỉ để đem lại trải nghiệm êm ái trong từng bước đi.
                        </p>
                    </div>
                    <div className="value-card">
                        <h3>Dịch vụ tận tâm</h3>
                        <p>
                            Hỗ trợ chuyên nghiệp cùng chính sách đổi trả minh bạch để bạn mua sắm an tâm tuyệt đối.
                        </p>
                    </div>
                </div>
            </section>

            <section className="about-story">
                <div className="about-story-inner container">
                    <div className="story-copy">
                        <span className="section-subtitle">Hành trình SHOEVIET</span>
                        <h2>Sự kết hợp giữa đam mê thiết kế và tinh thần thể thao.</h2>
                        <p>
                            Từ lúc hình thành ý tưởng đến khi chiếc giày đến tay khách hàng, SHOEVIET luôn theo đuổi
                            trải nghiệm hoàn hảo. Chúng tôi mong muốn mỗi bước chân đều trở nên nhẹ nhàng, đầy cảm hứng và
                            sẵn sàng chinh phục thử thách mới.
                        </p>
                    </div>
                    <div className="story-cards">
                        <div className="story-card">
                            <h3>Tư vấn cá nhân hóa</h3>
                            <p>
                                Đội ngũ tư vấn hiểu rõ phong cách và nhu cầu để giúp bạn chọn được đôi giày phù hợp nhất.
                            </p>
                        </div>
                        <div className="story-card">
                            <h3>Chuẩn mực bền vững</h3>
                            <p>
                                Chú trọng đến nguồn nguyên liệu và quy trình sản xuất để giảm thiểu tác động môi trường.
                            </p>
                        </div>
                        <div className="story-card">
                            <h3>Cộng đồng đam mê</h3>
                            <p>
                                SHOEVIET là nơi kết nối những người yêu giày và yêu phong cách sống năng động, trẻ trung.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default About;
