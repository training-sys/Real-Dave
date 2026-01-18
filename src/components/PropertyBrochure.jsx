import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register a font if needed, otherwise use standard fonts
// Font.register({ family: 'Roboto', src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf' });

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 10,
  },
  logoSection: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1677ff', // Ant Design Blue
  },
  subText: {
    fontSize: 10,
    color: '#666',
  },
  subscriberLogo: {
    width: 60,
    height: 60,
    objectFit: 'contain',
  },
  heroImage: {
    width: '100%',
    height: 250,
    objectFit: 'cover',
    borderRadius: 4,
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
  },
  titleSection: {
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  priceTag: {
    fontSize: 18,
    color: '#1677ff',
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 4,
  },
  gridItem: {
    width: '33%',
    marginBottom: 10,
  },
  gridLabel: {
    fontSize: 9,
    color: '#888',
    textTransform: 'uppercase',
  },
  gridValue: {
    fontSize: 11,
    color: '#333',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 4,
  },
  description: {
    fontSize: 11,
    lineHeight: 1.5,
    color: '#444',
    textAlign: 'justify',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  tag: {
    backgroundColor: '#e6f7ff',
    color: '#1890ff',
    fontSize: 10,
    padding: '4 8',
    borderRadius: 10,
    marginRight: 5,
    marginBottom: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9,
    color: '#999',
  },
  link: {
    fontSize: 11,
    color: '#1677ff',
    textDecoration: 'none',
    marginBottom: 4,
  },
});

const PropertyBrochure = ({ property, userProfile, appSettings }) => {
  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

  // Fallback image if none provided
  // Note: react-pdf requires valid URLs. Relative paths might fail if not resolved.
  // We'll try to use the first image from property.images, or a placeholder.
  const mainImage = (property.images && property.images.length > 0 && property.images[0].url)
    ? property.images[0].url
    : 'https://via.placeholder.com/800x400?text=No+Image+Available';

  // Google Maps Link Logic
  const mapLink = property.locationUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.address} ${property.city}`)}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Text style={styles.companyName}>{appSettings.companyName || 'RealE-Market'}</Text>
            <Text style={styles.subText}>Comprehensive Real Estate Solutions</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            {appSettings.subscriberLogoUrl ? (
              <Image src={appSettings.subscriberLogoUrl} style={styles.subscriberLogo} />
            ) : (
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{userProfile.name}</Text>
            )}
            <Text style={styles.subText}>{userProfile.email}</Text>
          </View>
        </View>

        {/* Hero Image */}
        {/* Note: In a real app, ensure CORS is handled for images or they are base64 */}
        <Image src={mainImage} style={styles.heroImage} />

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{property.title}</Text>
          <Text style={styles.location}>
            {property.society ? `${property.society}, ` : ''}{property.area}, {property.city || ''}
          </Text>
          <Text style={styles.priceTag}>{formatCurrency(property.price)}</Text>
        </View>

        {/* Key Details Grid */}
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Type</Text>
            <Text style={styles.gridValue}>{property.type} - {property.propertyType}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Configuration</Text>
            <Text style={styles.gridValue}>{property.bedrooms} BHK / {property.bathrooms} Bath</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Area Size</Text>
            <Text style={styles.gridValue}>{property.areaSize} {property.sizeUnit}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Status</Text>
            <Text style={styles.gridValue}>{property.status}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Furnishing</Text>
            <Text style={styles.gridValue}>{property.furniture || 'Unspecified'}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Available From</Text>
            <Text style={styles.gridValue}>{property.availableFrom || 'Ready to Move'}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {property.description || 'No description provided.'}
          </Text>
        </View>

        {/* Features & Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features & Amenities</Text>
          <View style={styles.tagContainer}>
            {property.features && property.features.map((feature, index) => (
              <Text key={`f-${index}`} style={styles.tag}>• {feature}</Text>
            ))}
            {property.amenities && property.amenities.map((amenity, index) => (
              <Text key={`a-${index}`} style={styles.tag}>• {amenity}</Text>
            ))}
            {(!property.features?.length && !property.amenities?.length) && (
              <Text style={styles.description}>No specific features listed.</Text>
            )}
          </View>
        </View>

        {/* Video & Location Links Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Virtual Tour & Location</Text>
          {property.videoLink && (
            <View style={{ flexDirection: 'row', marginBottom: 4 }}>
              <Text style={{ fontSize: 11, color: '#333', width: 80 }}>Video Tour:</Text>
              <Text style={styles.link}>{property.videoLink}</Text>
            </View>
          )}
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ fontSize: 11, color: '#333', width: 80 }}>Google Map:</Text>
            <Text style={styles.link}>{mapLink}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated by {appSettings.companyName || 'RealE-Market'} Software
          </Text>
          <Text style={styles.footerText}>
            Contact: {userProfile.phone} | {userProfile.email}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default PropertyBrochure;
